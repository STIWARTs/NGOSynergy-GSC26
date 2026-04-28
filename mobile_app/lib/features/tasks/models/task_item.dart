// features/tasks/models/task_item.dart
// Domain model – pure Dart, no Flutter/UI imports.
// Business logic (scoring, matching) lives in backend services; this file
// is ONLY a data-transfer / display model for the UI layer.

enum TaskType { medical, food, disaster, other }

enum TaskSeverity { low, medium, high, critical }

enum TaskStatus { pending, inProgress, completed }

class TaskItem {
  final String id;
  final String title;
  final String location;
  final TaskType type;
  final TaskSeverity severity;
  TaskStatus status;
  String? assignedTo;
  final DateTime timestamp;
  final int? priority;
  final String? description;
  final TaskCoordinates coordinates;

  TaskItem({
    required this.id,
    required this.title,
    required this.location,
    required this.type,
    required this.severity,
    required this.status,
    this.assignedTo,
    required this.timestamp,
    this.priority,
    this.description,
    required this.coordinates,
  });

  /// Returns true when no volunteer has been assigned yet.
  bool get isUnassigned => assignedTo == null;

  // ---------------------------------------------------------------------------
  // JSON deserialization — maps backend TaskDTO → TaskItem
  // ---------------------------------------------------------------------------

  factory TaskItem.fromJson(Map<String, dynamic> json) {
    return TaskItem(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Untitled Task',
      location: json['location'] as String? ?? 'Unknown location',
      type: _parseType(json['category'] as String? ?? ''),
      severity: _parseSeverity((json['severity'] as num?)?.toInt() ?? 5),
      status: _parseStatus(json['status'] as String? ?? 'pending'),
      assignedTo: json['assignedVolunteerId'] as String?,
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
      description: json['description'] as String?,
      coordinates: TaskCoordinates.fromJson(
          json['coordinates'] as Map<String, dynamic>?),
    );
  }

  static TaskType _parseType(String cat) {
    final c = cat.toLowerCase();
    if (c.contains('medical') || c.contains('health')) return TaskType.medical;
    if (c.contains('food') || c.contains('water') || c.contains('supply')) {
      return TaskType.food;
    }
    if (c.contains('flood') ||
        c.contains('earthquake') ||
        c.contains('fire') ||
        c.contains('landslide') ||
        c.contains('disaster')) {
      return TaskType.disaster;
    }
    return TaskType.other;
  }

  static TaskSeverity _parseSeverity(int score) {
    if (score >= 9) return TaskSeverity.critical;
    if (score >= 7) return TaskSeverity.high;
    if (score >= 5) return TaskSeverity.medium;
    return TaskSeverity.low;
  }

  static TaskStatus _parseStatus(String s) {
    switch (s) {
      case 'active':
      case 'verified':
        return TaskStatus.inProgress;
      case 'resolved':
        return TaskStatus.completed;
      default:
        return TaskStatus.pending;
    }
  }

  // ---------------------------------------------------------------------------

  TaskItem copyWith({
    String? id,
    String? title,
    String? location,
    TaskType? type,
    TaskSeverity? severity,
    TaskStatus? status,
    String? assignedTo,
    DateTime? timestamp,
    int? priority,
    String? description,
  }) {
    return TaskItem(
      id: id ?? this.id,
      title: title ?? this.title,
      location: location ?? this.location,
      type: type ?? this.type,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      assignedTo: assignedTo ?? this.assignedTo,
      timestamp: timestamp ?? this.timestamp,
      priority: priority ?? this.priority,
      description: description ?? this.description,
      coordinates: coordinates ?? this.coordinates,
    );
  }
}


// ---------------------------------------------------------------------------
// Display-only extensions (label, icon, color) – no business logic.
// ---------------------------------------------------------------------------

extension TaskTypeDisplay on TaskType {
  String get label {
    switch (this) {
      case TaskType.medical:
        return 'Medical';
      case TaskType.food:
        return 'Food & Water';
      case TaskType.disaster:
        return 'Disaster';
      case TaskType.other:
        return 'Other';
    }
  }

  String get iconAsset {
    // Returns a semantic name so widgets can map to Icons.*
    switch (this) {
      case TaskType.medical:
        return 'medical';
      case TaskType.food:
        return 'food';
      case TaskType.disaster:
        return 'disaster';
      case TaskType.other:
        return 'other';
    }
  }
}

extension TaskSeverityDisplay on TaskSeverity {
  String get label {
    switch (this) {
      case TaskSeverity.low:
        return 'Low';
      case TaskSeverity.medium:
        return 'Medium';
      case TaskSeverity.high:
        return 'High';
      case TaskSeverity.critical:
        return 'Critical';
    }
  }
}

extension TaskStatusDisplay on TaskStatus {
  String get label {
    switch (this) {
      case TaskStatus.pending:
        return 'Pending';
      case TaskStatus.inProgress:
        return 'In Progress';
      case TaskStatus.completed:
        return 'Completed';
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

String taskTimeAgo(DateTime dt) {
  final diff = DateTime.now().difference(dt);
  if (diff.inSeconds < 60) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  return '${diff.inDays}d ago';
}

class TaskCoordinates {
  final double lat;
  final double lng;

  TaskCoordinates({required this.lat, required this.lng});

  factory TaskCoordinates.fromJson(Map<String, dynamic>? json) {
    return TaskCoordinates(
      lat: (json?['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json?['lng'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
