// features/tasks/services/task_service.dart
//
// Service layer for task data access.
// - Fetches live data from the Express backend via ApiClient.
// - Business logic (filtering, sorting) lives HERE, not in widgets.
// - Keeps ChangeNotifier so existing ListenableBuilder widgets need no changes.

import 'package:flutter/foundation.dart';
import '../models/task_item.dart';
import '../../../core/services/api_client.dart';

class TaskService extends ChangeNotifier {
  // Singleton pattern
  static final TaskService _instance = TaskService._internal();

  factory TaskService() {
    return _instance;
  }

  TaskService._internal();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  List<TaskItem> _tasks = [];
  bool isLoading = false;
  String? error;

  // ---------------------------------------------------------------------------
  // Public read accessors
  // ---------------------------------------------------------------------------

  List<TaskItem> getAllTasks() => List.unmodifiable(_tasks);

  List<TaskItem> getTasksForVolunteer(String userId) =>
      _tasks.where((t) => t.assignedTo == userId).toList();

  List<TaskItem> getTasksForVolunteerByStatus(
    String volunteerId,
    TaskStatus? status,
  ) {
    final myTasks = getTasksForVolunteer(volunteerId);
    if (status == null) return myTasks;
    return myTasks.where((t) => t.status == status).toList();
  }

  int countForVolunteer(String volunteerId, TaskStatus status) =>
      getTasksForVolunteer(volunteerId)
          .where((t) => t.status == status)
          .length;

  // ---------------------------------------------------------------------------
  // Fetch from backend
  // ---------------------------------------------------------------------------

  /// Fetches all tasks from the backend. Call on screen init and pull-to-refresh.
  Future<void> fetchTasks() async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final data = await ApiClient.get('/api/tasks') as List<dynamic>;
      _tasks = data
          .map((j) => TaskItem.fromJson(j as Map<String, dynamic>))
          .toList();
    } catch (e) {
      error = e.toString();
      debugPrint('TaskService.fetchTasks error: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Fetches only tasks assigned to a specific volunteer.
  Future<void> fetchTasksForVolunteer(String volunteerId) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final data = await ApiClient.get(
              '/api/tasks?volunteerId=${Uri.encodeComponent(volunteerId)}')
          as List<dynamic>;
      _tasks = data
          .map((j) => TaskItem.fromJson(j as Map<String, dynamic>))
          .toList();
    } catch (e) {
      error = e.toString();
      debugPrint('TaskService.fetchTasksForVolunteer error: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  // ---------------------------------------------------------------------------
  // Write operations — call backend then refresh
  // ---------------------------------------------------------------------------

  /// Volunteer accepts a pending task. Calls PATCH /api/tasks/:id/accept.
  Future<void> acceptTask(String taskId, String volunteerId) async {
    try {
      await ApiClient.patch(
        '/api/tasks/$taskId/accept',
        {'volunteerId': volunteerId},
      );
      await fetchTasks();
    } catch (e) {
      error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  /// Volunteer marks their in-progress task as complete.
  Future<void> completeTask(String taskId) async {
    try {
      await ApiClient.patch('/api/tasks/$taskId/complete', {});
      await fetchTasks();
    } catch (e) {
      error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
