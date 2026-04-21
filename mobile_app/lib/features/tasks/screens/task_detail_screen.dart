// features/tasks/screens/task_detail_screen.dart
//
// Displays full detail for a single TaskItem.
// - Receives the task via route arguments (no hardcoded data).
// - Shows contextual action buttons based on status/assignment.
// - No business logic: callbacks are passed in; state changes happen upstream.
// - All display mappings live in task_theme.dart (single source of truth).

import 'package:flutter/material.dart';
import '../models/task_item.dart';
import '../widgets/task_theme.dart';

// ---------------------------------------------------------------------------
// Route helper (keeps nav calls clean in other files)
// ---------------------------------------------------------------------------

class TaskDetailArgs {
  final TaskItem task;

  /// Optional callbacks – if null, the action buttons are hidden.
  final VoidCallback? onAcceptTask;
  final VoidCallback? onMarkCompleted;

  const TaskDetailArgs({
    required this.task,
    this.onAcceptTask,
    this.onMarkCompleted,
  });
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class TaskDetailScreen extends StatelessWidget {
  const TaskDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Args are always injected by the router – safe to cast.
    final args =
        ModalRoute.of(context)!.settings.arguments as TaskDetailArgs;
    final task = args.task;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: _buildAppBar(context, task),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
          children: [
            _TypeBanner(task: task),
            const SizedBox(height: 16),
            _DetailCard(task: task),
            const SizedBox(height: 16),
            _AssignmentCard(task: task),
            const SizedBox(height: 16),
            if (task.description != null && task.description!.isNotEmpty)
              _DescriptionCard(description: task.description!),
          ],
        ),
      ),
      bottomNavigationBar: _ActionBar(task: task, args: args),
    );
  }

  AppBar _buildAppBar(BuildContext context, TaskItem task) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        onPressed: () => Navigator.of(context).pop(),
        tooltip: 'Back',
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Task Detail',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A2E),
            ),
          ),
          Text(
            '# ${task.id}',
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF888888),
            ),
          ),
        ],
      ),
      actions: [
        _StatusPill(status: task.status),
        const SizedBox(width: 12),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Type Banner – prominent coloured hero at the top
// ---------------------------------------------------------------------------

class _TypeBanner extends StatelessWidget {
  final TaskItem task;
  const _TypeBanner({required this.task});

  @override
  Widget build(BuildContext context) {
    final color = taskTypeColor(task.type);
    final icon = taskTypeIcon(task.type);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withAlpha(230), color.withAlpha(150)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(60),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon bubble
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(50),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.type.label.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  task.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _SeverityChip(severity: task.severity),
                    const SizedBox(width: 8),
                    _TimeChip(timestamp: task.timestamp),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Detail Card – location & task metadata
// ---------------------------------------------------------------------------

class _DetailCard extends StatelessWidget {
  final TaskItem task;
  const _DetailCard({required this.task});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Task Information',
      icon: Icons.info_outline_rounded,
      children: [
        _DetailRow(
          icon: Icons.location_on_rounded,
          label: 'Location',
          value: task.location,
        ),
        _DetailRow(
          icon: Icons.category_rounded,
          label: 'Category',
          value: task.type.label,
          valueColor: taskTypeColor(task.type),
        ),
        _DetailRow(
          icon: Icons.priority_high_rounded,
          label: 'Severity',
          value: task.severity.label,
          valueColor: taskSeverityColor(task.severity),
        ),
        _DetailRow(
          icon: Icons.access_time_rounded,
          label: 'Reported',
          value: taskTimeAgo(task.timestamp),
          isLast: true,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Assignment Card
// ---------------------------------------------------------------------------

class _AssignmentCard extends StatelessWidget {
  final TaskItem task;
  const _AssignmentCard({required this.task});

  @override
  Widget build(BuildContext context) {
    final isUnassigned = task.isUnassigned;

    return _SectionCard(
      title: 'Assignment',
      icon: Icons.person_rounded,
      children: [
        _DetailRow(
          icon: isUnassigned
              ? Icons.person_off_rounded
              : Icons.verified_user_rounded,
          label: 'Volunteer',
          value: isUnassigned ? 'Unassigned' : task.assignedTo ?? 'Unassigned',
          valueColor: isUnassigned ? const Color(0xFFFF6D00) : null,
          isLast: true,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Description Card (optional field)
// ---------------------------------------------------------------------------

class _DescriptionCard extends StatelessWidget {
  final String description;
  const _DescriptionCard({required this.description});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Description',
      icon: Icons.notes_rounded,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            description,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF444444),
              height: 1.6,
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Action Bar (bottom, contextual)
// ---------------------------------------------------------------------------

class _ActionBar extends StatelessWidget {
  final TaskItem task;
  final TaskDetailArgs args;

  const _ActionBar({required this.task, required this.args});

  @override
  Widget build(BuildContext context) {
    // Determine which primary action to show (if any)
    Widget? primaryAction;

    if (task.status == TaskStatus.pending && task.isUnassigned) {
      primaryAction = _PrimaryButton(
        label: 'Accept Task',
        icon: Icons.volunteer_activism_rounded,
        color: const Color(0xFF1E88E5),
        onPressed: args.onAcceptTask != null
            ? () {
                args.onAcceptTask!();
                Navigator.of(context).pop();
              }
            : null,
      );
    } else if (task.status == TaskStatus.inProgress) {
      primaryAction = _PrimaryButton(
        label: 'Mark as Completed',
        icon: Icons.check_circle_rounded,
        color: const Color(0xFF43A047),
        onPressed: args.onMarkCompleted != null
            ? () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Confirm Completion'),
                    content: const Text('Are you sure you want to mark this task as completed?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () {
                          Navigator.of(ctx).pop(); // Close dialog
                          args.onMarkCompleted!();
                          Navigator.of(context).pop(); // Close detail screen
                        },
                        child: const Text('Confirm'),
                      ),
                    ],
                  ),
                );
              }
            : null,
      );
    }

    if (primaryAction == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 16,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: primaryAction,
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback? onPressed;

  const _PrimaryButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
          ),
        ),
        icon: Icon(icon, size: 20),
        label: Text(label),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Reusable section card
// ---------------------------------------------------------------------------

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card header
          Row(
            children: [
              Icon(icon, size: 16, color: const Color(0xFF888888)),
              const SizedBox(width: 6),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF888888),
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Detail row (icon + label + value)
// ---------------------------------------------------------------------------

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  final bool isLast;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            children: [
              Icon(icon, size: 18, color: const Color(0xFFAAAAAA)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF888888),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(
                  value,
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: valueColor ?? const Color(0xFF1A1A2E),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (!isLast)
          const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Small badge widgets (reusable)
// ---------------------------------------------------------------------------

class _SeverityChip extends StatelessWidget {
  final TaskSeverity severity;
  const _SeverityChip({required this.severity});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(50),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white54, width: 1),
      ),
      child: Text(
        severity.label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final DateTime timestamp;
  const _TimeChip({required this.timestamp});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.access_time_rounded,
            color: Colors.white70, size: 13),
        const SizedBox(width: 4),
        Text(
          taskTimeAgo(timestamp),
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

class _StatusPill extends StatelessWidget {
  final TaskStatus status;
  const _StatusPill({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = taskStatusColor(status);
    final icon = taskStatusIcon(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(80), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 13),
          const SizedBox(width: 5),
          Text(
            status.label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
