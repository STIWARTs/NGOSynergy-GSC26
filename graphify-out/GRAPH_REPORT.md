# Graph Report - .  (2026-04-28)

## Corpus Check
- 148 files · ~76,836 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 465 nodes · 471 edges · 84 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_task list screen dart|task list screen dart]]
- [[_COMMUNITY_Backend API Node Express TypeScript|Backend API Node Express TypeScript]]
- [[_COMMUNITY_processReport|processReport]]
- [[_COMMUNITY_package flutter material dart|package flutter material dart]]
- [[_COMMUNITY_task detail screen dart|task detail screen dart]]
- [[_COMMUNITY_firebaseService ts|firebaseService ts]]
- [[_COMMUNITY_home screen dart|home screen dart]]
- [[_COMMUNITY_task card widget dart|task card widget dart]]
- [[_COMMUNITY_Text|Text]]
- [[_COMMUNITY_pipelineService ts|pipelineService ts]]
- [[_COMMUNITY_chat room screen dart|chat room screen dart]]
- [[_COMMUNITY_emitGlobalToast|emitGlobalToast]]
- [[_COMMUNITY_profile screen dart|profile screen dart]]
- [[_COMMUNITY_useDigitization ts|useDigitization ts]]
- [[_COMMUNITY_BatchUpload tsx|BatchUpload tsx]]
- [[_COMMUNITY_DocumentViewer tsx|DocumentViewer tsx]]
- [[_COMMUNITY_useCrises ts|useCrises ts]]
- [[_COMMUNITY_HITLVerification tsx|HITLVerification tsx]]
- [[_COMMUNITY_PipelineUpload tsx|PipelineUpload tsx]]
- [[_COMMUNITY_Flutter Logo Mark|Flutter Logo Mark]]
- [[_COMMUNITY_migrateMockToReal ts|migrateMockToReal ts]]
- [[_COMMUNITY_task item dart|task item dart]]
- [[_COMMUNITY_App tsx|App tsx]]
- [[_COMMUNITY_IncidentFeedItem tsx|IncidentFeedItem tsx]]
- [[_COMMUNITY_PrioritizedIssues tsx|PrioritizedIssues tsx]]
- [[_COMMUNITY_useIncidents ts|useIncidents ts]]
- [[_COMMUNITY_useVerification ts|useVerification ts]]
- [[_COMMUNITY_CommunicationHub tsx|CommunicationHub tsx]]
- [[_COMMUNITY_CrisisReports tsx|CrisisReports tsx]]
- [[_COMMUNITY_Flutter Logo|Flutter Logo]]
- [[_COMMUNITY_DocumentsTable tsx|DocumentsTable tsx]]
- [[_COMMUNITY_AIWeightsContext tsx|AIWeightsContext tsx]]
- [[_COMMUNITY_useMatching ts|useMatching ts]]
- [[_COMMUNITY_useVolunteers ts|useVolunteers ts]]
- [[_COMMUNITY_AIConfig tsx|AIConfig tsx]]
- [[_COMMUNITY_Dashboard tsx|Dashboard tsx]]
- [[_COMMUNITY_seed ts|seed ts]]
- [[_COMMUNITY_MainActivity|MainActivity]]
- [[_COMMUNITY_chat message dart|chat message dart]]
- [[_COMMUNITY_route constants dart|route constants dart]]
- [[_COMMUNITY_AppLayout|AppLayout]]
- [[_COMMUNITY_isActive|isActive]]
- [[_COMMUNITY_getColorByScore|getColorByScore]]
- [[_COMMUNITY_SkillBadge|SkillBadge]]
- [[_COMMUNITY_StatCard tsx|StatCard tsx]]
- [[_COMMUNITY_StatusBadge tsx|StatusBadge tsx]]
- [[_COMMUNITY_useConfig ts|useConfig ts]]
- [[_COMMUNITY_utils ts|utils ts]]
- [[_COMMUNITY_PublicReportPage|PublicReportPage]]
- [[_COMMUNITY_VolunteerDirectory tsx|VolunteerDirectory tsx]]
- [[_COMMUNITY_postcss config js|postcss config js]]
- [[_COMMUNITY_tailwind config ts|tailwind config ts]]
- [[_COMMUNITY_vite config d ts|vite config d ts]]
- [[_COMMUNITY_vite config js|vite config js]]
- [[_COMMUNITY_vite config ts|vite config ts]]
- [[_COMMUNITY_config js|config js]]
- [[_COMMUNITY_debug js|debug js]]
- [[_COMMUNITY_test pro formula js|test pro formula js]]
- [[_COMMUNITY_generate training data py|generate training data py]]
- [[_COMMUNITY_predictor py|predictor py]]
- [[_COMMUNITY_test predictions py|test predictions py]]
- [[_COMMUNITY_train model py|train model py]]
- [[_COMMUNITY_build gradle kts|build gradle kts]]
- [[_COMMUNITY_settings gradle kts|settings gradle kts]]
- [[_COMMUNITY_build gradle kts|build gradle kts]]
- [[_COMMUNITY_vite env d ts|vite env d ts]]
- [[_COMMUNITY_config ts|config ts]]
- [[_COMMUNITY_crises ts|crises ts]]
- [[_COMMUNITY_digitization ts|digitization ts]]
- [[_COMMUNITY_documents ts|documents ts]]
- [[_COMMUNITY_incidents ts|incidents ts]]
- [[_COMMUNITY_matching ts|matching ts]]
- [[_COMMUNITY_reports ts|reports ts]]
- [[_COMMUNITY_verification ts|verification ts]]
- [[_COMMUNITY_volunteers ts|volunteers ts]]
- [[_COMMUNITY_SingleDocument tsx|SingleDocument tsx]]
- [[_COMMUNITY_TopBar tsx|TopBar tsx]]
- [[_COMMUNITY_Skeleton tsx|Skeleton tsx]]
- [[_COMMUNITY_VolunteerProfileSheet tsx|VolunteerProfileSheet tsx]]
- [[_COMMUNITY_VolunteerTable tsx|VolunteerTable tsx]]
- [[_COMMUNITY_mockData ts|mockData ts]]
- [[_COMMUNITY_queryKeys ts|queryKeys ts]]
- [[_COMMUNITY_index ts|index ts]]
- [[_COMMUNITY_NGO Synergy Platform|NGO Synergy Platform]]

## God Nodes (most connected - your core abstractions)
1. `package:flutter/material.dart` - 11 edges
2. `Backend API (Node/Express TypeScript)` - 11 edges
3. `processReport()` - 7 edges
4. `processText()` - 7 edges
5. `enhanceText()` - 7 edges
6. `../models/task_item.dart` - 6 edges
7. `Text` - 6 edges
8. `transformData()` - 5 edges
9. `getAuthToken()` - 5 edges
10. `pipelineService.ts Orchestrator` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Hybrid Pro Priority Formula` --semantically_similar_to--> `Quick-Score Formula (40/30/20/10)`  [INFERRED] [semantically similar]
  backend/Data Digitization Pipeline/PRO_PRIORITY_FORMULA.md → PrioritizationSystem.md
- `extractStructuredData()` --calls--> `Text`  [INFERRED]
  backend\Data Digitization Pipeline\gemini.js → mobile_app\lib\features\tasks\screens\volunteer_tasks_screen.dart
- `runFullTest()` --calls--> `processText()`  [INFERRED]
  backend\Data Digitization Pipeline\test.js → backend\Data Digitization Pipeline\main.js
- `testAPI()` --calls--> `Text`  [INFERRED]
  backend\Data Digitization Pipeline\test-api-key.js → mobile_app\lib\features\tasks\screens\volunteer_tasks_screen.dart
- `processReport()` --calls--> `saveToDB()`  [INFERRED]
  backend\Data Digitization Pipeline\main.js → backend\Data Digitization Pipeline\db.js

## Hyperedges (group relationships)
- **Backend AI and Data Service Stack** — root_backend_api, root_firestore, root_gemini_service, root_document_ai_service, root_vertex_ai_mode, root_poc_ml_mode [EXTRACTED 0.90]
- **Volunteer Task Synchronization Flow** — root_flutter_app, root_tasks_api, root_incidents_api, root_data_model_alignment, root_firebase_auth [INFERRED 0.78]
- **Digitization to Prioritization Pipeline** — root_digi_api, root_document_ai_service, root_gemini_service, root_priority_formula, root_crises_collection, root_pipeline_service [EXTRACTED 0.92]

## Communities

### Community 0 - "task list screen dart"
Cohesion: 0.05
Nodes (36): AppBar, BorderSide, build, _buildAppBar, Column, _countByStatus, dispose, Expanded (+28 more)

### Community 1 - "Backend API Node Express TypeScript"
Cohesion: 0.08
Nodes (31): Admin Config API (/api/admin/*), Admin Dashboard (React/Vite), Centralized Frontend API Client, Backend API (Node/Express TypeScript), Android Emulator CORS Mapping (10.0.2.2), Crises Collection, TaskDTO to TaskItem Data Alignment, DEV_MODE Auth Bypass (+23 more)

### Community 2 - "processReport"
Cohesion: 0.1
Nodes (17): saveToDB(), calculateConfidence(), detectMimeType(), extractText(), extractStructuredData(), processReport(), processText(), enhanceText() (+9 more)

### Community 3 - "package flutter material dart"
Cohesion: 0.07
Nodes (24): ../features/chat/screens/chat_room_screen.dart, ../features/home/screens/home_screen.dart, ../features/profile/screens/profile_screen.dart, ../features/tasks/screens/task_detail_screen.dart, ../features/tasks/screens/task_list_screen.dart, ../features/tasks/screens/volunteer_tasks_screen.dart, Color, taskSeverityColor (+16 more)

### Community 4 - "task detail screen dart"
Cohesion: 0.08
Nodes (25): _ActionBar, AppBar, _AssignmentCard, build, _buildAppBar, Column, Container, _DescriptionCard (+17 more)

### Community 5 - "firebaseService ts"
Cohesion: 0.16
Nodes (0): 

### Community 6 - "home screen dart"
Cohesion: 0.09
Nodes (21): _BannerStat, build, Card, Column, Container, _Header, HomeScreen, ListView (+13 more)

### Community 7 - "task card widget dart"
Cohesion: 0.1
Nodes (20): build, _CardFooter, _CardHeader, Center, Container, Expanded, _LocationRow, Padding (+12 more)

### Community 8 - "Text"
Cohesion: 0.15
Nodes (13): ApiError, fetchApi(), fetchApiBlob(), fetchApiFormData(), getAuthToken(), getIdToken(), signInWithEmail(), signInWithGoogle() (+5 more)

### Community 9 - "pipelineService ts"
Cohesion: 0.14
Nodes (8): buildDocumentContext(), chatWithDocument(), generateDocumentSummary(), generateMockResponse(), detectMimeType(), runOCR(), getBucketCandidates(), withResolvedBucket()

### Community 10 - "chat room screen dart"
Cohesion: 0.1
Nodes (18): dart:async, build, Center, ChatRoomScreen, _ChatRoomScreenState, dispose, _MessageBubble, Padding (+10 more)

### Community 11 - "emitGlobalToast"
Cohesion: 0.2
Nodes (4): emitGlobalToast(), async(), async(), updateStatus()

### Community 12 - "profile screen dart"
Cohesion: 0.2
Nodes (9): build, Expanded, _InfoTile, ListTile, ProfileScreen, _ProfileScreenState, Scaffold, SizedBox (+1 more)

### Community 13 - "useDigitization ts"
Cohesion: 0.22
Nodes (2): DigitizationHub(), useDigitizationQueue()

### Community 14 - "BatchUpload tsx"
Cohesion: 0.33
Nodes (2): handleDrop(), processFiles()

### Community 15 - "DocumentViewer tsx"
Cohesion: 0.4
Nodes (2): handleKeyDown(), sendMessage()

### Community 16 - "useCrises ts"
Cohesion: 0.33
Nodes (0): 

### Community 17 - "HITLVerification tsx"
Cohesion: 0.4
Nodes (0): 

### Community 18 - "PipelineUpload tsx"
Cohesion: 0.6
Nodes (3): finalizePipeline(), runPipeline(), simulatePipelineAnimation()

### Community 19 - "Flutter Logo Mark"
Cohesion: 0.4
Nodes (5): Android Launcher Icon, Flutter Brand Identity, Flutter Framework Branding, Flutter Logo Mark, Mobile App Launcher Icon

### Community 20 - "migrateMockToReal ts"
Cohesion: 0.83
Nodes (3): clearCollection(), insertDocuments(), migrateData()

### Community 21 - "task item dart"
Cohesion: 0.5
Nodes (3): copyWith, TaskItem, taskTimeAgo

### Community 22 - "App tsx"
Cohesion: 0.5
Nodes (0): 

### Community 23 - "IncidentFeedItem tsx"
Cohesion: 0.5
Nodes (0): 

### Community 24 - "PrioritizedIssues tsx"
Cohesion: 0.5
Nodes (0): 

### Community 25 - "useIncidents ts"
Cohesion: 0.5
Nodes (0): 

### Community 26 - "useVerification ts"
Cohesion: 0.5
Nodes (0): 

### Community 27 - "CommunicationHub tsx"
Cohesion: 0.5
Nodes (0): 

### Community 28 - "CrisisReports tsx"
Cohesion: 0.67
Nodes (2): handleDrop(), handleFileSelect()

### Community 29 - "Flutter Logo"
Cohesion: 0.5
Nodes (4): Blue geometric logo design, Flutter brand mark, Flutter Logo, Mobile App Launcher Icon

### Community 30 - "DocumentsTable tsx"
Cohesion: 0.67
Nodes (0): 

### Community 31 - "AIWeightsContext tsx"
Cohesion: 0.67
Nodes (0): 

### Community 32 - "useMatching ts"
Cohesion: 0.67
Nodes (0): 

### Community 33 - "useVolunteers ts"
Cohesion: 0.67
Nodes (0): 

### Community 34 - "AIConfig tsx"
Cohesion: 0.67
Nodes (0): 

### Community 35 - "Dashboard tsx"
Cohesion: 0.67
Nodes (0): 

### Community 36 - "seed ts"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "MainActivity"
Cohesion: 1.0
Nodes (1): MainActivity

### Community 38 - "chat message dart"
Cohesion: 1.0
Nodes (1): ChatMessage

### Community 39 - "route constants dart"
Cohesion: 1.0
Nodes (1): RouteConstants

### Community 40 - "AppLayout"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "isActive"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "getColorByScore"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "SkillBadge"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "StatCard tsx"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "StatusBadge tsx"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "useConfig ts"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "utils ts"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "PublicReportPage"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "VolunteerDirectory tsx"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "postcss config js"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "tailwind config ts"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "vite config d ts"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "vite config js"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "vite config ts"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "config js"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "debug js"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "test pro formula js"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "generate training data py"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "predictor py"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "test predictions py"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "train model py"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "build gradle kts"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "settings gradle kts"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "build gradle kts"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "vite env d ts"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "config ts"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "crises ts"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "digitization ts"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "documents ts"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "incidents ts"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "matching ts"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "reports ts"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "verification ts"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "volunteers ts"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "SingleDocument tsx"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "TopBar tsx"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Skeleton tsx"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "VolunteerProfileSheet tsx"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "VolunteerTable tsx"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "mockData ts"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "queryKeys ts"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "index ts"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "NGO Synergy Platform"
Cohesion: 1.0
Nodes (1): NGO Synergy Platform

## Knowledge Gaps
- **171 isolated node(s):** `MainActivity`, `MyApp`, `main`, `build`, `MaterialApp` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `seed ts`** (2 nodes): `seed.ts`, `seed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MainActivity`** (2 nodes): `MainActivity`, `MainActivity.kt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `chat message dart`** (2 nodes): `chat_message.dart`, `ChatMessage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `route constants dart`** (2 nodes): `route_constants.dart`, `RouteConstants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AppLayout`** (2 nodes): `AppLayout()`, `AppLayout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `isActive`** (2 nodes): `isActive()`, `Sidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `getColorByScore`** (2 nodes): `getColorByScore()`, `ReliabilityScore.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SkillBadge`** (2 nodes): `SkillBadge()`, `SkillBadge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `StatCard tsx`** (2 nodes): `StatCard.tsx`, `StatCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `StatusBadge tsx`** (2 nodes): `StatusBadge.tsx`, `getStatusStyles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `useConfig ts`** (2 nodes): `useConfig.ts`, `useSaveConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `utils ts`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PublicReportPage`** (2 nodes): `PublicReportPage()`, `PublicReport.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `VolunteerDirectory tsx`** (2 nodes): `VolunteerDirectory.tsx`, `handleViewProfile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `postcss config js`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `tailwind config ts`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `vite config d ts`** (1 nodes): `vite.config.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `vite config js`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `vite config ts`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `config js`** (1 nodes): `config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `debug js`** (1 nodes): `debug.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `test pro formula js`** (1 nodes): `test-pro-formula.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `generate training data py`** (1 nodes): `generate_training_data.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `predictor py`** (1 nodes): `predictor.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `test predictions py`** (1 nodes): `test_predictions.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `train model py`** (1 nodes): `train_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `build gradle kts`** (1 nodes): `build.gradle.kts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `settings gradle kts`** (1 nodes): `settings.gradle.kts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `build gradle kts`** (1 nodes): `build.gradle.kts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `vite env d ts`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `config ts`** (1 nodes): `config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `crises ts`** (1 nodes): `crises.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `digitization ts`** (1 nodes): `digitization.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `documents ts`** (1 nodes): `documents.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `incidents ts`** (1 nodes): `incidents.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `matching ts`** (1 nodes): `matching.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `reports ts`** (1 nodes): `reports.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `verification ts`** (1 nodes): `verification.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `volunteers ts`** (1 nodes): `volunteers.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SingleDocument tsx`** (1 nodes): `SingleDocument.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `TopBar tsx`** (1 nodes): `TopBar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skeleton tsx`** (1 nodes): `Skeleton.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `VolunteerProfileSheet tsx`** (1 nodes): `VolunteerProfileSheet.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `VolunteerTable tsx`** (1 nodes): `VolunteerTable.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `mockData ts`** (1 nodes): `mockData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `queryKeys ts`** (1 nodes): `queryKeys.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `index ts`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `NGO Synergy Platform`** (1 nodes): `NGO Synergy Platform`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `package:flutter/material.dart` connect `package flutter material dart` to `task list screen dart`, `task detail screen dart`, `home screen dart`, `task card widget dart`, `chat room screen dart`, `profile screen dart`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `Text` connect `Text` to `task list screen dart`, `processReport`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `extractStructuredData()` connect `processReport` to `Text`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `processReport()` (e.g. with `extractText()` and `enhanceText()`) actually correct?**
  _`processReport()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `processText()` (e.g. with `enhanceText()` and `extractStructuredData()`) actually correct?**
  _`processText()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `enhanceText()` (e.g. with `processReport()` and `processText()`) actually correct?**
  _`enhanceText()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `MainActivity`, `MyApp`, `main` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._