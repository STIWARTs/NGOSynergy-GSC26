// features/tasks/screens/volunteer_tasks_screen.dart
//
// Shows only the tasks assigned to the currently logged-in volunteer.
// - Data fetching & filtering delegated to TaskService (no business logic here).
// - Uses shared TaskCard / TaskEmptyState / TaskFilterTabs / TaskStatRow widgets.
// - currentUserId is simulated; replace with auth provider in production.

import 'package:flutter/material.dart';
import '../models/task_item.dart';
import '../services/task_service.dart';
import '../widgets/task_card_widget.dart';
import '../../../core/services/auth_service.dart';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class VolunteerTasksScreen extends StatefulWidget {
  const VolunteerTasksScreen({super.key});

  @override
  State<VolunteerTasksScreen> createState() => _VolunteerTasksScreenState();
}

class _VolunteerTasksScreenState extends State<VolunteerTasksScreen>
    with SingleTickerProviderStateMixin {
  final _taskService = TaskService();
  final _auth = AuthService();
  late final TabController _tabController;
  bool _fetched = false;

  // Tab configuration: null = All, otherwise filter by status
  static const List<TaskStatus?> _statusFilters = [
    null,
    TaskStatus.inProgress,
    TaskStatus.completed,
  ];

  static const List<String> _tabLabels = ['All', 'Active', 'Completed'];

  TaskStatus? _selectedStatus; // null → All

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: _statusFilters.length,
      vsync: this,
    );
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) return;
      setState(() {
        _selectedStatus = _statusFilters[_tabController.index];
      });
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_fetched) {
      _fetched = true;
      final uid = _auth.currentUid ?? '';
      _taskService.fetchTasksForVolunteer(uid);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Delegate all filtering to the service – no logic in UI.
  List<TaskItem> get _visibleTasks => _taskService.getTasksForVolunteerByStatus(
        _auth.currentUid ?? '',
        _selectedStatus,
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: ListenableBuilder(
        listenable: _taskService,
        builder: (context, _) {
          final uid = _auth.currentUid ?? '';
          final allMyTasks = _taskService.getTasksForVolunteer(uid);
          final visible = _visibleTasks;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Loading / error indicator
              if (_taskService.isLoading)
                const LinearProgressIndicator()
              else if (_taskService.error != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  color: Theme.of(context).colorScheme.errorContainer,
                  child: Text(
                    'Could not load: ${_taskService.error}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                      fontSize: 12,
                    ),
                  ),
                ),
              // Stats for this volunteer only
              TaskStatRow(
                total: allMyTasks.length,
                active: _taskService.countForVolunteer(
                    uid, TaskStatus.inProgress),
                completed: _taskService.countForVolunteer(
                    uid, TaskStatus.completed),
              ),
              // Filter tabs
              TaskFilterTabs(
                controller: _tabController,
                labels: _tabLabels,
              ),
              // Task list with pull-to-refresh
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => _taskService.fetchTasksForVolunteer(uid),
                  child: visible.isEmpty
                      ? TaskEmptyState(
                          message: _selectedStatus == null
                              ? 'No tasks assigned to you'
                              : 'No ${_tabLabels[_tabController.index].toLowerCase()} tasks',
                          subtitle:
                              'Pull down to refresh or check back soon.',
                        )
                      : ListView.builder(
                          padding:
                              const EdgeInsets.fromLTRB(16, 12, 16, 100),
                          itemCount: visible.length,
                          itemBuilder: (ctx, i) =>
                              TaskCard(task: visible[i]),
                        ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  AppBar _buildAppBar(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return AppBar(
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('My Tasks'),
          Text(
            'Your assigned tasks',
            style: TextStyle(
              color: cs.onSurfaceVariant,
              fontSize: 11,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Icon(Icons.notifications_none_rounded,
              color: cs.onSurfaceVariant, size: 24),
          onPressed: () {},
          tooltip: 'Notifications',
        ),
        const SizedBox(width: 4),
      ],
    );
  }
}
