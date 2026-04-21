// features/tasks/widgets/task_theme.dart
// Centralised colour/icon mappings for task types, severities, and statuses.
// Keeps ALL display logic out of individual screens – import this everywhere.

import 'package:flutter/material.dart';
import '../models/task_item.dart';

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

Color taskTypeColor(TaskType type) {
  switch (type) {
    case TaskType.medical:
      return const Color(0xFFE53935);
    case TaskType.food:
      return const Color(0xFF43A047);
    case TaskType.disaster:
      return const Color(0xFFFB8C00);
    case TaskType.other:
      return const Color(0xFF5E35B1);
  }
}

IconData taskTypeIcon(TaskType type) {
  switch (type) {
    case TaskType.medical:
      return Icons.local_hospital_rounded;
    case TaskType.food:
      return Icons.restaurant_rounded;
    case TaskType.disaster:
      return Icons.warning_amber_rounded;
    case TaskType.other:
      return Icons.handyman_rounded;
  }
}

// ---------------------------------------------------------------------------
// Severity
// ---------------------------------------------------------------------------

Color taskSeverityColor(TaskSeverity severity) {
  switch (severity) {
    case TaskSeverity.low:
      return const Color(0xFF43A047);
    case TaskSeverity.medium:
      return const Color(0xFFFFA726);
    case TaskSeverity.high:
      return const Color(0xFFEF5350);
    case TaskSeverity.critical:
      return const Color(0xFFB71C1C);
  }
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

Color taskStatusColor(TaskStatus status) {
  switch (status) {
    case TaskStatus.pending:
      return const Color(0xFFFFB300);
    case TaskStatus.inProgress:
      return const Color(0xFF1E88E5);
    case TaskStatus.completed:
      return const Color(0xFF43A047);
  }
}

IconData taskStatusIcon(TaskStatus status) {
  switch (status) {
    case TaskStatus.pending:
      return Icons.schedule_rounded;
    case TaskStatus.inProgress:
      return Icons.sync_rounded;
    case TaskStatus.completed:
      return Icons.check_circle_rounded;
  }
}
