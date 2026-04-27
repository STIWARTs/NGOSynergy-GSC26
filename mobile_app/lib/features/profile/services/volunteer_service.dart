// lib/features/profile/services/volunteer_service.dart
//
// Fetches the authenticated volunteer's own profile from the backend.

import '../../tasks/models/task_item.dart';
import '../../../core/services/api_client.dart';

/// Lightweight volunteer profile model for the app.
class VolunteerProfile {
  final String id;
  final String name;
  final String email;
  final List<String> skills;
  final List<String> certifications;
  final String status;
  final double reliabilityScore;
  final int pastDeployments;
  final String avatarInitials;

  const VolunteerProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.skills,
    required this.certifications,
    required this.status,
    required this.reliabilityScore,
    required this.pastDeployments,
    required this.avatarInitials,
  });

  String get firstName => name.split(' ').first;

  factory VolunteerProfile.fromJson(Map<String, dynamic> json) {
    return VolunteerProfile(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Volunteer',
      email: json['email'] as String? ?? '',
      skills: (json['skills'] as List<dynamic>?)?.cast<String>() ?? [],
      certifications:
          (json['certifications'] as List<dynamic>?)?.cast<String>() ?? [],
      status: json['status'] as String? ?? 'active',
      reliabilityScore:
          (json['reliabilityScore'] as num?)?.toDouble() ?? 0.0,
      pastDeployments: json['pastDeployments'] as int? ?? 0,
      avatarInitials: json['avatarInitials'] as String? ?? 'V',
    );
  }

  /// Returns a TaskStatus-compatible volunteer status label for display.
  String get statusLabel {
    switch (status) {
      case 'active':
        return 'Active Volunteer';
      case 'deployed':
        return 'Currently Deployed';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  }
}

class VolunteerService {
  static final VolunteerService _instance = VolunteerService._internal();
  factory VolunteerService() => _instance;
  VolunteerService._internal();

  VolunteerProfile? _cachedProfile;

  /// Fetches the current user's profile. Caches after first call.
  Future<VolunteerProfile> getMyProfile({bool forceRefresh = false}) async {
    if (_cachedProfile != null && !forceRefresh) return _cachedProfile!;
    final data = await ApiClient.get('/api/volunteers/me') as Map<String, dynamic>;
    _cachedProfile = VolunteerProfile.fromJson(data);
    return _cachedProfile!;
  }

  void clearCache() => _cachedProfile = null;
}
