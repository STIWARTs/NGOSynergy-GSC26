// features/profile/screens/profile_screen.dart
//
// Displays the authenticated volunteer's real profile data pulled from
// GET /api/volunteers/me via VolunteerService.

import 'package:flutter/material.dart';
import '../services/volunteer_service.dart';
import '../../../core/services/auth_service.dart';
import '../../../routes/route_constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _volunteerService = VolunteerService();
  final _authService = AuthService();

  late Future<VolunteerProfile> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = _volunteerService.getMyProfile();
  }

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      _volunteerService.clearCache();
      await _authService.signOut();
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          RouteConstants.login,
          (_) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Sign Out',
            onPressed: _signOut,
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: FutureBuilder<VolunteerProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return _ErrorView(
              message: snapshot.error.toString(),
              onRetry: () => setState(() {
                _profileFuture =
                    _volunteerService.getMyProfile(forceRefresh: true);
              }),
            );
          }

          final profile = snapshot.data!;
          return _ProfileBody(profile: profile);
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Profile body — separated so FutureBuilder stays clean
// ---------------------------------------------------------------------------

class _ProfileBody extends StatefulWidget {
  final VolunteerProfile profile;
  const _ProfileBody({required this.profile});

  @override
  State<_ProfileBody> createState() => _ProfileBodyState();
}

class _ProfileBodyState extends State<_ProfileBody> {
  bool get _isActive => widget.profile.status == 'active';

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final profile = widget.profile;

    return SingleChildScrollView(
      child: Column(
        children: [
          // ── Hero header ───────────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [cs.primaryContainer, cs.surface],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: Column(
              children: [
                // Avatar
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: cs.primary,
                    border: Border.all(color: cs.surface, width: 4),
                    boxShadow: [
                      BoxShadow(
                        color: cs.shadow.withAlpha(40),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      )
                    ],
                  ),
                  child: profile.avatarInitials.isNotEmpty
                      ? Center(
                          child: Text(
                            profile.avatarInitials,
                            style: TextStyle(
                              color: cs.onPrimary,
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        )
                      : Icon(Icons.person_rounded,
                          size: 48, color: cs.onPrimary),
                ),
                const SizedBox(height: 14),
                Text(
                  profile.name,
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall
                      ?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: cs.onSurface,
                      ),
                ),
                const SizedBox(height: 6),
                // Status badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                  decoration: BoxDecoration(
                    color: _isActive
                        ? cs.secondaryContainer
                        : cs.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle,
                          size: 8,
                          color: _isActive
                              ? cs.secondary
                              : cs.onSurfaceVariant),
                      const SizedBox(width: 6),
                      Text(
                        profile.statusLabel,
                        style: TextStyle(
                          color: _isActive
                              ? cs.onSecondaryContainer
                              : cs.onSurfaceVariant,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Stats ─────────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Row(
              children: [
                _StatCard(
                  title: 'Deployments',
                  value: '${profile.pastDeployments}',
                  icon: Icons.task_alt_rounded,
                  containerColor: cs.primaryContainer,
                  iconColor: cs.primary,
                  onContainerColor: cs.onPrimaryContainer,
                ),
                const SizedBox(width: 14),
                _StatCard(
                  title: 'Reliability',
                  value:
                      '${profile.reliabilityScore.toStringAsFixed(0)}%',
                  icon: Icons.verified_rounded,
                  containerColor: cs.tertiaryContainer,
                  iconColor: cs.tertiary,
                  onContainerColor: cs.onTertiaryContainer,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Contact Details ───────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Card(
              child: Column(
                children: [
                  _InfoTile(
                    icon: Icons.email_rounded,
                    title: 'Email',
                    subtitle: profile.email.isNotEmpty
                        ? profile.email
                        : 'Not available',
                  ),
                  _Divider(context),
                  _InfoTile(
                    icon: Icons.medical_services_rounded,
                    title: 'Skills',
                    subtitle: profile.skills.isNotEmpty
                        ? profile.skills.join(', ')
                        : 'None listed',
                  ),
                  if (profile.certifications.isNotEmpty) ...[
                    _Divider(context),
                    _InfoTile(
                      icon: Icons.workspace_premium_rounded,
                      title: 'Certifications',
                      subtitle: profile.certifications.join(', '),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _Divider(BuildContext context) => Divider(
        height: 1,
        indent: 56,
        color: Theme.of(context).colorScheme.outlineVariant,
      );
}

// ---------------------------------------------------------------------------
// Error view
// ---------------------------------------------------------------------------

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded, size: 56, color: cs.error),
            const SizedBox(height: 16),
            Text(
              'Could not load profile',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: cs.onSurface),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shared sub-widgets
// ---------------------------------------------------------------------------

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color containerColor;
  final Color iconColor;
  final Color onContainerColor;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.containerColor,
    required this.iconColor,
    required this.onContainerColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: containerColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: iconColor, size: 26),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: onContainerColor,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: onContainerColor.withAlpha(180),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _InfoTile(
      {required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: cs.primary, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(fontSize: 12, color: cs.onSurfaceVariant),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
            fontSize: 14,
            color: cs.onSurface,
            fontWeight: FontWeight.w600),
      ),
    );
  }
}
