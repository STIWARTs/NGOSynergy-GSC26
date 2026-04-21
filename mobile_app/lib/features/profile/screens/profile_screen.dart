// features/profile/screens/profile_screen.dart
import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isActive = true;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ── Hero header ──────────────────────────────────────────────
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
                    child: Icon(
                      Icons.person_rounded,
                      size: 48,
                      color: cs.onPrimary,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Piyush',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: cs.onSurface,
                        ),
                  ),
                  const SizedBox(height: 6),
                  // Active toggle
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 5),
                        decoration: BoxDecoration(
                          color: _isActive ? cs.secondaryContainer : cs.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.circle,
                                size: 8,
                                color: _isActive ? cs.secondary : cs.onSurfaceVariant),
                            const SizedBox(width: 6),
                            Text(
                              _isActive ? 'Active Volunteer' : 'Inactive',
                              style: TextStyle(
                                color: _isActive ? cs.onSecondaryContainer : cs.onSurfaceVariant,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Switch(
                        value: _isActive,
                        activeTrackColor: cs.secondaryContainer,
                        activeThumbColor: cs.secondary,
                        onChanged: (val) {
                          setState(() {
                            _isActive = val;
                          });
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ── Stats ────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Row(
                children: [
                  _StatCard(
                    title: 'Tasks Completed',
                    value: '42',
                    icon: Icons.task_alt_rounded,
                    containerColor: cs.primaryContainer,
                    iconColor: cs.primary,
                    onContainerColor: cs.onPrimaryContainer,
                  ),
                  const SizedBox(width: 14),
                  _StatCard(
                    title: 'Hours Served',
                    value: '128',
                    icon: Icons.timer_rounded,
                    containerColor: cs.tertiaryContainer,
                    iconColor: cs.tertiary,
                    onContainerColor: cs.onTertiaryContainer,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Details ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Card(
                child: Column(
                  children: [
                    _InfoTile(
                        icon: Icons.email_rounded,
                        title: 'Email',
                        subtitle: 'piyush.volunteer@gsc.com'),
                    Divider(
                        height: 1,
                        indent: 56,
                        color: Theme.of(context).colorScheme.outlineVariant),
                    _InfoTile(
                        icon: Icons.phone_rounded,
                        title: 'Phone',
                        subtitle: '+91 98765 43210'),
                    Divider(
                        height: 1,
                        indent: 56,
                        color: Theme.of(context).colorScheme.outlineVariant),
                    _InfoTile(
                        icon: Icons.location_on_rounded,
                        title: 'Base Location',
                        subtitle: 'Sarona, Raipur'),
                    Divider(
                        height: 1,
                        indent: 56,
                        color: Theme.of(context).colorScheme.outlineVariant),
                    _InfoTile(
                        icon: Icons.medical_services_rounded,
                        title: 'Skills',
                        subtitle: 'First Aid, Logistics, Driving'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

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
