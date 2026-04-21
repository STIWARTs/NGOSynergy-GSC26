// features/home/screens/home_screen.dart
//
// Landing screen – acts as the central navigation hub.
// - Greets the current volunteer.
// - Shows a live summary of their task counts (from TaskService).
// - Provides large tap-target nav cards to all connected screens.
// - No business logic; all data from TaskService.

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../routes/route_constants.dart';
import '../../tasks/services/task_service.dart';
import '../../tasks/models/task_item.dart';

// Simulated current user – replace with auth in production.
const String _currentUserId = 'volunteer_1';
const String _currentUserName = 'Piyush'; // first name only

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final taskService = TaskService();
    return Scaffold(
      body: SafeArea(
        child: ListenableBuilder(
          listenable: taskService,
          builder: (context, _) {
            final myTasks = taskService.getTasksForVolunteer(_currentUserId);
            final myActive = taskService.countForVolunteer(_currentUserId, TaskStatus.inProgress);
            final myCompleted = taskService.countForVolunteer(_currentUserId, TaskStatus.completed);
            final totalSystemTasks = taskService.getAllTasks().length;

            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          children: [
            // ── Header ──────────────────────────────────────────────────────
            _Header(name: _currentUserName),
            const SizedBox(height: 24),

            // ── Volunteer stats banner ───────────────────────────────────────
            _MyStatsBanner(
              total: myTasks.length,
              active: myActive,
              completed: myCompleted,
            ),
            const SizedBox(height: 28),

            // ── Section title ────────────────────────────────────────────────
            const _SectionTitle(title: 'QUICK ACCESS'),
            const SizedBox(height: 14),

            // ── Primary nav cards ─────────────────────────────────────────────
            _NavCard(
              title: 'My Tasks',
              subtitle: 'View tasks assigned to you',
              icon: Icons.task_alt_rounded,
              badge: myActive > 0 ? '$myActive active' : null,
              onTap: () =>
                  Navigator.pushNamed(context, RouteConstants.volunteerTasks),
            ),
            const SizedBox(height: 14),
            _NavCard(
              title: 'Task Dashboard',
              subtitle: 'Browse all $totalSystemTasks system-wide tasks',
              icon: Icons.dashboard_rounded,
              onTap: () => Navigator.pushNamed(context, RouteConstants.tasks),
            ),
            const SizedBox(height: 28),

            // ── Secondary Actions ─────────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: _SmallNavCard(
                    title: 'Chat',
                    icon: Icons.chat_bubble_outline_rounded,
                    onTap: () =>
                        Navigator.pushNamed(context, RouteConstants.chatRoom),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: _SmallNavCard(
                    title: 'Profile',
                    icon: Icons.person_rounded,
                    onTap: () =>
                        Navigator.pushNamed(context, RouteConstants.profile),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _NavCard(
              title: 'Upload Report',
              subtitle: 'Report an Issue',
              icon: Icons.upload_file_rounded,
              onTap: () async {
                final url = Uri.parse('https://github.com/piyerx');
                if (!await launchUrl(url, mode: LaunchMode.inAppBrowserView)) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Could not open link')),
                    );
                  }
                }
              },
            ),
            const SizedBox(height: 50),
            // ── Footer ────────────────────────────────────────────────────────
            Center(
              child: Text(
                'Created for GSC 2026',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Theme.of(context).colorScheme.onSurfaceVariant.withAlpha(120),
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ],
            );
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Header with greeting and notification icon
// ---------------------------------------------------------------------------

class _Header extends StatelessWidget {
  final String name;
  const _Header({required this.name});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Good morning'
        : hour < 17
            ? 'Good afternoon'
            : 'Good evening';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Avatar
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: cs.primaryContainer,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(Icons.volunteer_activism_rounded,
              color: cs.onPrimaryContainer, size: 26),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$greeting, $name!',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: cs.onSurface,
                      height: 1.2,
                    ),
              ),
              const SizedBox(height: 3),
              Text(
                'Smart Volunteer Coordination',
                style: TextStyle(
                  fontSize: 12,
                  color: cs.onSurfaceVariant,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          icon: Icon(Icons.notifications_none_rounded,
              color: cs.onSurfaceVariant, size: 24),
          onPressed: () {},
          tooltip: 'Notifications',
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Volunteer task summary banner
// ---------------------------------------------------------------------------

class _MyStatsBanner extends StatelessWidget {
  final int total;
  final int active;
  final int completed;

  const _MyStatsBanner({
    required this.total,
    required this.active,
    required this.completed,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      decoration: BoxDecoration(
        color: cs.primaryContainer,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: cs.primary.withAlpha(30),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Tasks',
                  style: TextStyle(
                    color: cs.onPrimaryContainer.withAlpha(180),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '$total assigned',
                  style: TextStyle(
                    color: cs.onPrimaryContainer,
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          _BannerStat(
              label: 'Active',
              value: active,
              color: cs.primary),
          const SizedBox(width: 24),
          _BannerStat(
              label: 'Done',
              value: completed,
              color: cs.tertiary),
        ],
      ),
    );
  }
}

class _BannerStat extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _BannerStat({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      children: [
        Text(
          '$value',
          style: TextStyle(
            color: color,
            fontSize: 24,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: cs.onPrimaryContainer.withAlpha(180),
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Section title
// ---------------------------------------------------------------------------

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: Theme.of(context).colorScheme.onSurfaceVariant,
        letterSpacing: 1.2,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Large navigation card (primary actions) – uses M3 Card + InkWell
// ---------------------------------------------------------------------------

class _NavCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final String? badge;
  final VoidCallback onTap;

  const _NavCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              // Icon bubble
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: cs.primaryContainer,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: cs.onPrimaryContainer, size: 26),
              ),
              const SizedBox(width: 16),
              // Text
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: cs.onSurface,
                          ),
                        ),
                        if (badge != null) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: cs.errorContainer,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              badge!,
                              style: TextStyle(
                                color: cs.onErrorContainer,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: cs.onSurfaceVariant,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios_rounded,
                  size: 16, color: cs.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Small navigation card (secondary actions)
// ---------------------------------------------------------------------------

class _SmallNavCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _SmallNavCard({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 22),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: cs.secondaryContainer,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: cs.onSecondaryContainer, size: 24),
              ),
              const SizedBox(height: 10),
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: cs.onSurface,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
