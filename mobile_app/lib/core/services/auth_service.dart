// lib/core/services/auth_service.dart
//
// Firebase Auth wrapper for the volunteer app.
// - Provides sign-in, sign-out, and token retrieval.
// - Used by ApiClient to inject Bearer tokens into every request.
// - Used by screens to read the current user's UID and display name.

import 'package:firebase_auth/firebase_auth.dart';

class AuthService {
  static final _auth = FirebaseAuth.instance;

  // Sign in with email + password. Returns UserCredential on success.
  Future<UserCredential> signInWithEmail(String email, String password) =>
      _auth.signInWithEmailAndPassword(email: email, password: password);

  // Get the Firebase ID token for the current user (refreshes if expired).
  Future<String?> getIdToken() async => _auth.currentUser?.getIdToken();

  // Stream of auth-state changes — useful for auth-gated routing.
  Stream<User?> get userStream => _auth.authStateChanges();

  /// The currently signed-in Firebase user (null if not logged in).
  User? get currentUser => _auth.currentUser;

  /// UID of the currently signed-in user (null if not logged in).
  String? get currentUid => _auth.currentUser?.uid;

  /// Display name or email fallback for greeting purposes.
  String get displayName {
    final user = _auth.currentUser;
    if (user == null) return 'Volunteer';
    if (user.displayName != null && user.displayName!.isNotEmpty) {
      return user.displayName!.split(' ').first;
    }
    return user.email?.split('@').first ?? 'Volunteer';
  }

  Future<void> signOut() => _auth.signOut();
}
