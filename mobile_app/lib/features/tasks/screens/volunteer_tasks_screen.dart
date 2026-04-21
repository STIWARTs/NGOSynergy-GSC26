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

// ---------------------------------------------------------------------------
// Simulated auth – replace with auth provider / FirebaseAuth.instance.currentUser
// ---------------------------------------------------------------------------

const String _currentUserId = 'volunteer_1';

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
  late final TabController _tabController;

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
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Delegate all filtering to the service – no logic in UI.
  List<TaskItem> get _visibleTasks => _taskService.getTasksForVolunteerByStatus(
        _currentUserId,
        _selectedStatus,
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: ListenableBuilder(
        listenable: _taskService,
        builder: (context, _) {
          final allMyTasks = _taskService.getTasksForVolunteer(_currentUserId);
          final visible = _visibleTasks;
          
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stats for this volunteer only
              TaskStatRow(
                total: allMyTasks.length,
                active: _taskService.countForVolunteer(
                    _currentUserId, TaskStatus.inProgress),
                completed: _taskService.countForVolunteer(
                    _currentUserId, TaskStatus.completed),
              ),
              // Filter tabs
              TaskFilterTabs(
                controller: _tabController,
                labels: _tabLabels,
              ),
              // Task list
              Expanded(
                child: visible.isEmpty
                    ? TaskEmptyState(
                        message: _selectedStatus == null
                            ? 'No tasks assigned to you'
                            : 'No ${_tabLabels[_tabController.index].toLowerCase()} tasks',
                        subtitle: 'Check back soon or contact your coordinator.',
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                        itemCount: visible.length,
                        itemBuilder: (ctx, i) => TaskCard(task: visible[i]),
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
