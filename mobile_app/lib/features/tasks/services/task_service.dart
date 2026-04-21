// features/tasks/services/task_service.dart
//
// Service layer for task data access.
// - Business logic (filtering, sorting) lives HERE, not in widgets.
// - Simulated local data for MVP; replace _allTasks with Firestore calls later.
// - All public methods return plain List<TaskItem> (no Flutter deps).

import 'package:flutter/foundation.dart';
import '../models/task_item.dart';

// ---------------------------------------------------------------------------
// Simulated data store – mirrors what Firestore will provide in production.
// In production: replace this with a stream from FirebaseFirestore.instance
//               .collection('tasks').snapshots()
// ---------------------------------------------------------------------------

class TaskService extends ChangeNotifier {
  // Singleton pattern
  static final TaskService _instance = TaskService._internal();

  factory TaskService() {
    return _instance;
  }

  TaskService._internal();

  final List<TaskItem> _tasks = [
    TaskItem(
      id: 'T001',
      title: 'Emergency insulin delivery',
      location: 'Sector 12, Relief Camp A',
      type: TaskType.medical,
      severity: TaskSeverity.critical,
      status: TaskStatus.inProgress,
      assignedTo: 'volunteer_1',
      timestamp: DateTime.now().subtract(const Duration(minutes: 12)),
      description:
          'Patient at relief camp A needs insulin urgently. Contact camp medic on arrival.',
    ),
    TaskItem(
      id: 'T002',
      title: 'Food distribution – Block 4',
      location: 'Community Hall, North Zone',
      type: TaskType.food,
      severity: TaskSeverity.medium,
      status: TaskStatus.pending,
      timestamp: DateTime.now().subtract(const Duration(minutes: 35)),
      description:
          'Distribute food packets to approximately 80 displaced families in Block 4.',
    ),
    TaskItem(
      id: 'T003',
      title: 'Flood evacuation – Zone B',
      location: 'River Road, Downtown',
      type: TaskType.disaster,
      severity: TaskSeverity.high,
      status: TaskStatus.pending,
      assignedTo: 'volunteer_2',
      timestamp: DateTime.now().subtract(const Duration(hours: 1)),
    ),
    TaskItem(
      id: 'T004',
      title: 'Blanket supply for shelter',
      location: 'Old School, East Wing',
      type: TaskType.other,
      severity: TaskSeverity.low,
      status: TaskStatus.completed,
      assignedTo: 'volunteer_1',
      timestamp: DateTime.now().subtract(const Duration(hours: 3)),
    ),
    TaskItem(
      id: 'T005',
      title: 'Cardiac emergency – elderly patient',
      location: 'House 7B, Refugee Camp',
      type: TaskType.medical,
      severity: TaskSeverity.critical,
      status: TaskStatus.pending,
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      description:
          'Elderly patient (approx. 70 years) experiencing chest pain. AED may be required.',
    ),
    TaskItem(
      id: 'T006',
      title: 'Water purification tablets',
      location: 'South Camp, Water Station',
      type: TaskType.food,
      severity: TaskSeverity.high,
      status: TaskStatus.inProgress,
      assignedTo: 'volunteer_1',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    TaskItem(
      id: 'T007',
      title: 'Collapsed building rescue',
      location: 'Market Street, Sector 5',
      type: TaskType.disaster,
      severity: TaskSeverity.critical,
      status: TaskStatus.inProgress,
      assignedTo: 'volunteer_2',
      timestamp: DateTime.now().subtract(const Duration(minutes: 48)),
      description:
          'Partial collapse reported. At least 3 people trapped on the second floor.',
    ),
  ];

  List<TaskItem> getAllTasks() => _tasks;

  List<TaskItem> getTasksForVolunteer(String userId) {
    return _tasks.where((t) => t.assignedTo == userId).toList();
  }

  List<TaskItem> getTasksForVolunteerByStatus(
    String volunteerId,
    TaskStatus? status,
  ) {
    final myTasks = getTasksForVolunteer(volunteerId);
    if (status == null) return myTasks;
    return myTasks.where((t) => t.status == status).toList();
  }

  int countForVolunteer(String volunteerId, TaskStatus status) =>
      getTasksForVolunteer(volunteerId).where((t) => t.status == status).length;

  void acceptTask(String taskId, String volunteerId) {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      _tasks[index].status = TaskStatus.inProgress;
      _tasks[index].assignedTo = volunteerId;
      notifyListeners();
    }
  }

  void completeTask(String taskId) {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index != -1) {
      _tasks[index].status = TaskStatus.completed;
      notifyListeners();
    }
  }
}
