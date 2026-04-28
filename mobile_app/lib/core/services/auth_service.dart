// lib/core/services/auth_service.dart
//
// Firebase Auth wrapper for the volunteer app.
// - Provides sign-in, sign-out, and token retrieval.
// - Used by ApiClient to inject Bearer tokens into every request.
// - Used by screens to read the current user's UID and display name.

import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

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

  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      return await _auth.signInWithCredential(credential);
    } catch (e) {
      print('Google Sign-In Error: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }
}
