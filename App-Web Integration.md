# App–Web Integration Plan
## NGO Resource Allocation — Volunteer App ↔ Admin Backend

> **Goal**: Replace the Flutter app's local mock data with live data served by the shared Express/Firebase backend so that actions taken on the web admin (deploying volunteers, updating incident status, etc.) are immediately visible to volunteers in the mobile app — and vice versa.

---

## 1. Current State Audit

### 1.1 Backend (`/backend`)
| Aspect | Detail |
|---|---|
| Runtime | Node.js + Express (TypeScript) |
| Database | Firebase Firestore (with mock-data fallback) |
| Auth | Firebase Admin SDK — verifies Firebase ID tokens via `authMiddleware`; `DEV_MODE=true` bypasses auth |
| Base URL | `http://localhost:8080` (env: `PORT`) |
| Existing routes | `/api/incidents`, `/api/volunteers`, `/api/match`, `/api/reports`, `/api/crises`, `/api/documents`, `/api/digitization`, `/api/verification`, `/api/admin` |
| Task concept | **No dedicated `/api/tasks` route exists.** Tasks live conceptually as _Incidents_ + _Assignments_ |
| Volunteer auth | Volunteers can authenticate via Firebase Auth, but the backend currently has no volunteer-specific write endpoints (only admin-guarded ones) |

### 1.2 Web Admin (`/src`)
| Aspect | Detail |
|---|---|
| Framework | Vite + React + TypeScript |
| API layer | `/src/api/` — typed wrappers around `fetchApi()` which attaches a Firebase ID token |
| Key APIs used | `volunteers.ts`, `incidents.ts`, `crises.ts`, `matching.ts`, `reports.ts` |
| Auth flow | Firebase Auth login → ID token injected into every request header |

### 1.3 Flutter App (`/mobile_app`)
| Aspect | Detail |
|---|---|
| Framework | Flutter (Dart, Material 3) |
| State | `TaskService extends ChangeNotifier` singleton |
| Data source | **Hardcoded in-memory list** inside `task_service.dart` (7 dummy tasks) |
| Auth | None — `_currentUserId = 'volunteer_1'` is a constant |
| HTTP client | `http` package is already in `pubspec.yaml` — just not used |
| Features | Home, Task List, Task Detail, Volunteer Tasks, Chat Room, Profile |

### 1.4 Gap Summary
| Gap | Impact |
|---|---|
| No real API calls in Flutter | Volunteers always see stale mock data regardless of admin actions |
| No volunteer auth in Flutter | Backend can't identify which volunteer is making requests |
| No `/api/tasks` endpoint | Flutter needs a task-centric view; current backend thinks in Incidents + Assignments |
| No volunteer-writable endpoints | Volunteers can't accept/complete tasks from the app |
| Data model mismatch | Flutter's `TaskItem` model ≠ backend's `Incident + Assignment` combo |
| No `.env` for Flutter | API base URL is not configurable |

---

## 2. Target Architecture

```
┌──────────────────────┐        ┌───────────────────────────┐
│   Flutter App        │        │   Web Admin (React/Vite)  │
│   (Volunteer)        │        │   (NGO Staff)             │
└────────┬─────────────┘        └────────────┬──────────────┘
         │  Firebase ID Token                 │  Firebase ID Token
         ▼                                    ▼
┌────────────────────────────────────────────────────────────┐
│               Express Backend (Node.js)                    │
│  /api/tasks       ← NEW (volunteer-facing)                 │
│  /api/incidents   (admin-facing, unchanged)                │
│  /api/volunteers  (admin-facing, + volunteer self-read)    │
│  /api/match, /api/crises, /api/reports  (unchanged)        │
└────────────────────────────┬───────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  Firebase        │
                    │  Firestore       │  ← Single source of truth
                    │  Firebase Auth   │
                    └─────────────────┘
```

---

## 3. Required Changes

### 3.1 Backend Changes

#### A. New `/api/tasks` Router (Volunteer-Facing)
Create `backend/src/routes/tasks.ts` — a volunteer-centric wrapper over Incidents + Assignments.

**Endpoints needed:**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Any authenticated | Returns incidents as tasks; supports `?volunteerId=`, `?status=` filters |
| `GET` | `/api/tasks/:id` | Any authenticated | Get single task/incident by ID |
| `PATCH` | `/api/tasks/:id/accept` | `volunteer` role | Accept a task → creates Assignment, sets incident `active` |
| `PATCH` | `/api/tasks/:id/complete` | `volunteer` role | Mark task complete → updates Assignment `completed`, incident `resolved` |

**Shape returned by `GET /api/tasks`:**
```typescript
interface TaskDTO {
  id: string             // incident ID
  title: string
  location: string
  category: string       // maps to TaskType in Flutter
  severity: number       // 1-10
  urgencyScore: number
  status: 'pending' | 'active' | 'resolved'
  assignedVolunteerId?: string
  assignedVolunteerName?: string
  description: string
  coordinates: { lat: number; lng: number }
  timestamp: string
}
```

#### B. Volunteer Self-Profile Endpoint
Add to `backend/src/routes/volunteers.ts`:
```
GET /api/volunteers/me   → returns the authenticated volunteer's own profile
```
Uses `req.user.uid` set by `authMiddleware`.

#### C. Auth Middleware — Volunteer Role Support
Currently `authMiddleware` reads `decodedToken.role` to set user role. Ensure Firebase Auth custom claims include `role: 'volunteer'` when a volunteer registers. Add a new middleware export `volunteerOnly` analogous to `adminOnly`:

```typescript
export const volunteerOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!['admin', 'volunteer'].includes(req.user?.role ?? '')) {
    return res.status(403).json({ error: 'Volunteer access required' })
  }
  next()
}
```

#### D. CORS Update
Add the Flutter app's origin for Android emulator:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:8080', 'http://localhost:5173']
}))
```
`10.0.2.2` maps to the host machine's `localhost` from inside the Android emulator.

---

### 3.2 Flutter App Changes

#### A. Environment Config (`flutter_dotenv` already installed)
Create `mobile_app/.env`:
```env
API_BASE_URL=http://10.0.2.2:8080    # Android emulator → host localhost
# API_BASE_URL=http://localhost:8080  # iOS simulator / web
```
Load in `main.dart`:
```dart
await dotenv.load(fileName: '.env');
```
Add `.env` to `pubspec.yaml` assets:
```yaml
flutter:
  assets:
    - .env
```

#### B. Firebase Auth for Flutter
Add Firebase packages to `pubspec.yaml`:
```yaml
firebase_core: ^3.x.x
firebase_auth: ^5.x.x
```
Run `flutterfire configure` to generate `google-services.json` / `GoogleService-Info.plist` using the **same Firebase project** as the backend.

Create `lib/core/services/auth_service.dart`:
```dart
import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  static final _auth = FirebaseAuth.instance;

  Future<UserCredential> signInWithEmail(String email, String password) =>
      _auth.signInWithEmailAndPassword(email: email, password: password);

  Future<String?> getIdToken() async =>
      await _auth.currentUser?.getIdToken();

  Stream<User?> get userStream => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;
  String? get currentUid => _auth.currentUser?.uid;

  Future<void> signOut() => _auth.signOut();
}
```

#### C. HTTP API Client
Create `lib/core/services/api_client.dart`:
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'auth_service.dart';

class ApiClient {
  static final _auth = AuthService();
  static String get _base => dotenv.get('API_BASE_URL');

  static Future<Map<String, String>> _headers() async {
    final token = await _auth.getIdToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> get(String path) async {
    final res = await http.get(Uri.parse('$_base$path'), headers: await _headers());
    _check(res);
    return jsonDecode(res.body);
  }

  static Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final res = await http.patch(
      Uri.parse('$_base$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    _check(res);
    return jsonDecode(res.body);
  }

  static void _check(http.Response res) {
    if (res.statusCode == 401) throw Exception('Unauthorized — please log in again');
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('API error ${res.statusCode}: ${res.body}');
    }
  }
}
```

#### D. Updated `TaskService` — Replace Mock Data with API Calls
Refactor `lib/features/tasks/services/task_service.dart`:

```dart
class TaskService extends ChangeNotifier {
  static final TaskService _instance = TaskService._internal();
  factory TaskService() => _instance;
  TaskService._internal();

  List<TaskItem> _tasks = [];
  bool isLoading = false;
  String? error;

  List<TaskItem> getAllTasks() => List.unmodifiable(_tasks);
  List<TaskItem> getTasksForVolunteer(String uid) =>
      _tasks.where((t) => t.assignedTo == uid).toList();

  Future<void> fetchTasks() async {
    isLoading = true; error = null; notifyListeners();
    try {
      final data = await ApiClient.get('/api/tasks') as List<dynamic>;
      _tasks = data.map((j) => TaskItem.fromJson(j as Map<String, dynamic>)).toList();
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false; notifyListeners();
    }
  }

  Future<void> fetchTasksForVolunteer(String volunteerId) async {
    isLoading = true; notifyListeners();
    try {
      final data = await ApiClient.get('/api/tasks?volunteerId=$volunteerId') as List<dynamic>;
      _tasks = data.map((j) => TaskItem.fromJson(j as Map<String, dynamic>)).toList();
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false; notifyListeners();
    }
  }

  Future<void> acceptTask(String taskId, String volunteerId) async {
    await ApiClient.patch('/api/tasks/$taskId/accept', {'volunteerId': volunteerId});
    await fetchTasks();
  }

  Future<void> completeTask(String taskId) async {
    await ApiClient.patch('/api/tasks/$taskId/complete', {});
    await fetchTasks();
  }

  // keep countForVolunteer and getTasksForVolunteerByStatus helpers unchanged
}
```

#### E. `TaskItem` Model — Add `fromJson` Factory
Add to `lib/features/tasks/models/task_item.dart`:
```dart
factory TaskItem.fromJson(Map<String, dynamic> json) {
  return TaskItem(
    id: json['id'] as String,
    title: json['title'] as String,
    location: json['location'] as String,
    type: _parseType(json['category'] as String? ?? ''),
    severity: _parseSeverity(json['severity'] as int? ?? 5),
    status: _parseStatus(json['status'] as String? ?? 'pending'),
    assignedTo: json['assignedVolunteerId'] as String?,
    timestamp: DateTime.parse(json['timestamp'] as String),
    description: json['description'] as String?,
  );
}

static TaskType _parseType(String cat) {
  switch (cat.toLowerCase()) {
    case 'medical emergency': return TaskType.medical;
    case 'flood': case 'earthquake': case 'fire': case 'landslide':
      return TaskType.disaster;
    case 'food': return TaskType.food;
    default: return TaskType.other;
  }
}

static TaskSeverity _parseSeverity(int score) {
  if (score >= 9) return TaskSeverity.critical;
  if (score >= 7) return TaskSeverity.high;
  if (score >= 5) return TaskSeverity.medium;
  return TaskSeverity.low;
}

static TaskStatus _parseStatus(String s) {
  switch (s) {
    case 'active': return TaskStatus.inProgress;
    case 'resolved': return TaskStatus.completed;
    default: return TaskStatus.pending;
  }
}
```

#### F. Auth Screen (Login)
Create `lib/features/auth/screens/login_screen.dart` — email/password form that calls `AuthService().signInWithEmail()`. On success, navigate to `AppRoutes.home`.

Update `main.dart`:
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const MyApp());
}

// In MyApp.build():
initialRoute: FirebaseAuth.instance.currentUser != null
    ? AppRoutes.home
    : AppRoutes.login,
```

#### G. Volunteer Profile — Pull from `/api/volunteers/me`
Create `lib/features/profile/services/volunteer_service.dart` to call `GET /api/volunteers/me` and display real name, skills, reliability score, and deployment history in `ProfileScreen`.

#### H. Replace `_currentUserId` Constant
Remove `const String _currentUserId = 'volunteer_1'` from `home_screen.dart`.  
Replace with: `final uid = AuthService().currentUid ?? '';`

---

## 4. Data Model Alignment

| Flutter `TaskItem` field | Backend `TaskDTO` field | Conversion |
|---|---|---|
| `id` | `id` (incident ID) | Direct |
| `title` | `title` | Direct |
| `location` | `location` | Direct |
| `type` (enum) | `category` (string) | `_parseType()` |
| `severity` (enum) | `severity` (1–10 int) | `_parseSeverity()` |
| `status` (enum) | `status` (string) | `pending→pending`, `active→inProgress`, `resolved→completed` |
| `assignedTo` | `assignedVolunteerId` | Direct |
| `timestamp` | `timestamp` (ISO string) | `DateTime.parse()` |
| `description` | `description` | Direct |

---

## 5. Phased Execution Plan

### Phase 1 — Backend: Volunteer Task API *(~2–3 hours)*
1. Create `backend/src/routes/tasks.ts` with 4 endpoints (§3.1-A).
2. `GET /api/tasks`: fetch all incidents from Firestore, resolve assignments to get `assignedVolunteerId`, map to `TaskDTO`. Support `?volunteerId=` and `?status=` query params.
3. `PATCH /api/tasks/:id/accept`: create Assignment + update incident to `active`.
4. `PATCH /api/tasks/:id/complete`: update Assignment to `completed`, incident to `resolved`, volunteer status to `active`.
5. Add `GET /api/volunteers/me` using `req.user!.uid`.
6. Add `volunteerOnly` middleware export.
7. Register router: `app.use('/api/tasks', tasksRouter)` in `index.ts`.
8. Test all endpoints with curl using `DEV_MODE=true`.

### Phase 2 — Flutter: Firebase Auth Setup *(~1–2 hours)*
1. Add `firebase_core`, `firebase_auth` to `pubspec.yaml` → `flutter pub get`.
2. Run `flutterfire configure` (same Firebase project).
3. Create `AuthService` (§3.2-B).
4. Create `LoginScreen` with email + password form.
5. Update `main.dart` for Firebase init and auth-gated routing.
6. Register `AppRoutes.login` in `AppRoutes`.

### Phase 3 — Flutter: API Client + Task Sync *(~2–3 hours)*
1. Create `mobile_app/.env`; add to assets in `pubspec.yaml`.
2. Create `ApiClient` (§3.2-C).
3. Add `fromJson` factory to `TaskItem` (§3.2-E).
4. Refactor `TaskService` (§3.2-D).
5. Call `taskService.fetchTasks()` in `initState` or `didChangeDependencies` of `HomeScreen` and `TaskListScreen`.
6. Replace `_currentUserId` constant (§3.2-H).

### Phase 4 — Flutter: Profile + Polish *(~1 hour)*
1. Create `VolunteerService.getMyProfile()` and update `ProfileScreen`.
2. Add `RefreshIndicator` (pull-to-refresh) on task list screens.
3. Show `CircularProgressIndicator` while `isLoading`, and a red banner for `error != null`.

### Phase 5 — End-to-End Test *(~1 hour)*
1. Start backend: `cd backend && npm run dev` (real Firebase or `DEV_MODE=true` fallback).
2. Run Flutter app on Android emulator (`API_BASE_URL=http://10.0.2.2:8080`).
3. Log in as a volunteer.
4. Confirm tasks seeded from backend appear in the app.
5. Accept a task → verify it shows as `active` on the web admin incident panel.
6. Complete a task → verify it resolves on the web admin.

---

## 6. File Map — What to Create / Modify

### New Files (Flutter)
```
mobile_app/
├── .env
└── lib/
    ├── core/services/
    │   ├── api_client.dart
    │   └── auth_service.dart
    └── features/
        ├── auth/screens/login_screen.dart
        └── profile/services/volunteer_service.dart
```

### Modified Files (Flutter)
```
mobile_app/
├── pubspec.yaml                    ← add firebase_core, firebase_auth, .env asset
├── lib/
│   ├── main.dart                   ← Firebase init, auth-gated routing
│   ├── routes/app_routes.dart      ← add login route
│   └── features/
│       ├── home/screens/home_screen.dart          ← replace _currentUserId
│       ├── tasks/models/task_item.dart             ← add fromJson
│       ├── tasks/services/task_service.dart        ← API calls instead of mock
│       ├── tasks/screens/task_list_screen.dart     ← loading + refresh
│       ├── tasks/screens/volunteer_tasks_screen.dart ← loading + refresh
│       └── profile/screens/profile_screen.dart    ← real volunteer data
```

### New Files (Backend)
```
backend/src/routes/tasks.ts         ← volunteer-facing task API
```

### Modified Files (Backend)
```
backend/src/
├── index.ts                        ← register /api/tasks
├── routes/volunteers.ts            ← add GET /me
└── middleware/authMiddleware.ts    ← add volunteerOnly guard
```

---

## 7. Quick-Start Checklist

- [ ] Firebase project has `role: 'volunteer'` custom claim set for volunteer accounts
- [ ] Backend `.env` has valid Firebase credentials (or `DEV_MODE=true` for dev)
- [ ] Flutter `mobile_app/.env` has correct `API_BASE_URL`
- [ ] `google-services.json` added to `mobile_app/android/app/`
- [ ] `GoogleService-Info.plist` added to `mobile_app/ios/Runner/` (if iOS needed)
- [ ] `.env` listed under `flutter.assets` in `pubspec.yaml`
- [ ] `flutter_dotenv` loads `.env` before `runApp()` in `main.dart`
- [ ] Backend CORS updated to allow the Flutter app's origin
- [ ] `DEV_MODE=false` in production / final demo

---

## 8. Key Design Decisions

| Decision | Rationale |
|---|---|
| New `/api/tasks` route instead of using `/api/incidents` directly | Keeps the volunteer API semantic (task-centric), avoids exposing admin-only incident metadata, and makes filtering by volunteer easy. |
| Map Incidents → TaskDTO in the backend, not the app | The Flutter model is display-only; transformation logic belongs server-side so the app stays thin. |
| Firebase Auth ID token for Flutter | Same auth provider as the web admin — one Firebase project, unified identity. No new auth system needed. |
| `flutter_dotenv` for config | Already in `pubspec.yaml`. Keeps the API URL out of source code and easily switchable between emulator/device/production. |
| Keep `ChangeNotifier` + `notifyListeners()` pattern | Matches existing `ListenableBuilder` usage throughout the app — zero refactoring of UI widgets needed. |
| Fetch-on-demand + pull-to-refresh instead of WebSocket | Sufficient for a PoC/hackathon scope; upgrade path to Firestore real-time listeners is straightforward later. |
