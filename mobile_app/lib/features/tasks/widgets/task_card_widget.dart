// features/tasks/widgets/task_card_widget.dart
//
// Public, reusable widgets shared between TaskListScreen and
// VolunteerTasksScreen (and any future task-related screens).
//
// IMPORTANT: No business logic here. Widgets receive data and callbacks only.

import 'package:flutter/material.dart';
import '../models/task_item.dart';
import '../screens/task_detail_screen.dart';
import '../services/task_service.dart';
import 'task_theme.dart';
import '../../../routes/route_constants.dart' as route_constants;

const String _currentUserId = 'volunteer_1';

// ---------------------------------------------------------------------------
// TaskCard – primary task list item; tapping navigates to TaskDetailScreen.
// ---------------------------------------------------------------------------

class TaskCard extends StatelessWidget {
  final TaskItem task;

  const TaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    final typeColor = taskTypeColor(task.type);
    final cs = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            debugPrint('Tapped on task: ${task.id}');
            Navigator.pushNamed(
              context,
              route_constants.RouteConstants.taskDetail,
              arguments: TaskDetailArgs(
                task: task,
                onAcceptTask:
                    task.isUnassigned && task.status == TaskStatus.pending
                        ? () {
                            TaskService().acceptTask(task.id, _currentUserId);
                            debugPrint('Accepted task: ${task.id}');
                          }
                        : null,
                onMarkCompleted: task.status == TaskStatus.inProgress
                    ? () {
                        TaskService().completeTask(task.id);
                        debugPrint('Completed task: ${task.id}');
                      }
                    : null,
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _CardHeader(task: task, typeColor: typeColor, cs: cs),
                const SizedBox(height: 10),
                Text(
                  task.title,
                  style: TextStyle(
                    color: cs.onSurface,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 6),
                _LocationRow(location: task.location, cs: cs),
                const SizedBox(height: 12),
                _CardFooter(task: task, cs: cs),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// TaskEmptyState – shown when a filtered list is empty.
// ---------------------------------------------------------------------------

class TaskEmptyState extends StatelessWidget {
  final String message;
  final String? subtitle;

  const TaskEmptyState({
    super.key,
    this.message = 'No tasks found',
    this.subtitle = 'Try adjusting your filters.',
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.inbox_rounded,
              size: 64, color: cs.onSurface.withAlpha(30)),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              color: cs.onSurfaceVariant,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: TextStyle(color: cs.outline, fontSize: 13),
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// TaskFilterTabs – picks up styling from the global TabBarTheme in main.dart.
// ---------------------------------------------------------------------------

class TaskFilterTabs extends StatelessWidget {
  final TabController controller;
  final List<String> labels;

  const TaskFilterTabs({
    super.key,
    required this.controller,
    required this.labels,
  });

  @override
  Widget build(BuildContext context) {
    return TabBar(
      controller: controller,
      isScrollable: true,
      tabAlignment: TabAlignment.start,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      tabs: labels.map((l) => Tab(text: l)).toList(),
    );
  }
}

// ---------------------------------------------------------------------------
// TaskStatRow – horizontal row of stat chips.
// ---------------------------------------------------------------------------

class TaskStatRow extends StatelessWidget {
  final int total;
  final int active;
  final int completed;

  const TaskStatRow({
    super.key,
    required this.total,
    required this.active,
    required this.completed,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Row(
        children: [
          _StatChip(
              label: 'Total',
              value: total,
              containerColor: cs.surfaceContainerHighest,
              valueColor: cs.onSurface),
          const SizedBox(width: 8),
          _StatChip(
              label: 'Active',
              value: active,
              containerColor: cs.primaryContainer,
              valueColor: cs.onPrimaryContainer),
          const SizedBox(width: 8),
          _StatChip(
              label: 'Done',
              value: completed,
              containerColor: cs.secondaryContainer,
              valueColor: cs.onSecondaryContainer),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Private sub-widgets (internal to this file)
// ---------------------------------------------------------------------------

class _StatChip extends StatelessWidget {
  final String label;
  final int value;
  final Color containerColor;
  final Color valueColor;

  const _StatChip({
    required this.label,
    required this.value,
    required this.containerColor,
    required this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: containerColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              '$value',
              style: TextStyle(
                color: valueColor,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                color: valueColor.withAlpha(180),
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CardHeader extends StatelessWidget {
  final TaskItem task;
  final Color typeColor;
  final ColorScheme cs;

  const _CardHeader(
      {required this.task, required this.typeColor, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: typeColor.withAlpha(38),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(taskTypeIcon(task.type), color: typeColor, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                task.type.label.toUpperCase(),
                style: TextStyle(
                  color: typeColor,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.1,
                ),
              ),
              Text(
                '# ${task.id}',
                style: TextStyle(
                  color: cs.onSurfaceVariant,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
        _SeverityBadge(severity: task.severity),
        const SizedBox(width: 8),
        _StatusBadge(status: task.status),
      ],
    );
  }
}

class _SeverityBadge extends StatelessWidget {
  final TaskSeverity severity;

  const _SeverityBadge({required this.severity});

  @override
  Widget build(BuildContext context) {
    final color = taskSeverityColor(severity);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(80), width: 1),
      ),
      child: Text(
        severity.label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final TaskStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = taskStatusColor(status);
    final icon = taskStatusIcon(status);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: color, size: 13),
        const SizedBox(width: 4),
        Text(
          status.label,
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _LocationRow extends StatelessWidget {
  final String location;
  final ColorScheme cs;

  const _LocationRow({required this.location, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(Icons.location_on_rounded,
            color: cs.onSurfaceVariant, size: 14),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            location,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: cs.onSurfaceVariant,
              fontSize: 12,
            ),
          ),
        ),
      ],
    );
  }
}

class _CardFooter extends StatelessWidget {
  final TaskItem task;
  final ColorScheme cs;

  const _CardFooter({required this.task, required this.cs});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(Icons.person_outline_rounded,
            color: cs.onSurfaceVariant, size: 14),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            task.assignedTo ?? 'Unassigned',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: task.isUnassigned
                  ? Theme.of(context).colorScheme.tertiary
                  : cs.onSurfaceVariant,
              fontSize: 12,
              fontWeight:
                  task.isUnassigned ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ),
        Icon(Icons.access_time_rounded,
            color: cs.onSurfaceVariant, size: 13),
        const SizedBox(width: 4),
        Text(
          taskTimeAgo(task.timestamp),
          style: TextStyle(
            color: cs.onSurfaceVariant,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
