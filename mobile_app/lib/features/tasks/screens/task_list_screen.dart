import 'package:flutter/material.dart';
import '../models/task_item.dart';
import '../widgets/task_card_widget.dart';
import '../services/task_service.dart';
import '../../../core/services/auth_service.dart';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _taskService = TaskService();

  // Filter state
  TaskStatus? _selectedStatus; // null → All
  String _searchQuery = '';
  bool _fetched = false;

  static const _statusFilters = [
    null,
    TaskStatus.pending,
    TaskStatus.inProgress,
    TaskStatus.completed,
  ];

  static const _tabLabels = ['All', 'Pending', 'In Progress', 'Completed'];

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
      _taskService.fetchTasks();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<TaskItem> get _filteredTasks {
    return TaskService().getAllTasks().where((task) {
      final matchesStatus =
          _selectedStatus == null || task.status == _selectedStatus;
      final query = _searchQuery.toLowerCase();
      final matchesSearch = query.isEmpty ||
          task.title.toLowerCase().contains(query) ||
          task.location.toLowerCase().contains(query) ||
          task.type.label.toLowerCase().contains(query);
      return matchesStatus && matchesSearch;
    }).toList()
      ..sort((a, b) => b.severity.index.compareTo(a.severity.index));
  }

  // Stats helpers
  int _countByStatus(TaskStatus s) =>
      TaskService().getAllTasks().where((t) => t.status == s).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: _buildAppBar(),
      body: ListenableBuilder(
        listenable: _taskService,
        builder: (context, _) {
          final filtered = _filteredTasks;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Loading / error banner
              if (_taskService.isLoading)
                const LinearProgressIndicator()
              else if (_taskService.error != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  color: Theme.of(context).colorScheme.errorContainer,
                  child: Text(
                    'Could not load tasks: ${_taskService.error}',
                    style: TextStyle(
                        color: Theme.of(context)
                            .colorScheme
                            .onErrorContainer,
                        fontSize: 12),
                  ),
                ),
              // 4-chip stats row (reused shared widget)
              _StatsRow(
                total: _taskService.getAllTasks().length,
                pending: _countByStatus(TaskStatus.pending),
                inProgress: _countByStatus(TaskStatus.inProgress),
                completed: _countByStatus(TaskStatus.completed),
              ),
              _SearchBar(
                onChanged: (q) => setState(() => _searchQuery = q),
              ),
              // Shared filter tabs widget
              TaskFilterTabs(
                controller: _tabController,
                labels: _tabLabels,
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _taskService.fetchTasks,
                  child: filtered.isEmpty
                      ? const TaskEmptyState(
                          message: 'No tasks found',
                          subtitle: 'Pull down to refresh or adjust filters.',
                        )
                      : ListView.builder(
                          padding:
                              const EdgeInsets.fromLTRB(16, 8, 16, 100),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, i) =>
                              TaskCard(task: filtered[i]),
                        ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFFF5F5F5),
      elevation: 0,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Task Dashboard',
            style: TextStyle(
              color: Colors.black87,
              fontSize: 20,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
          Text(
            'Smart Volunteer Coordination',
            style: TextStyle(
              color: Color(0xFF666666),
              fontSize: 11,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_none_rounded,
              color: Colors.black87, size: 24),
          onPressed: () {},
          tooltip: 'Notifications',
        ),
        const SizedBox(width: 4),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Sub-widgets used only by TaskListScreen
// (TaskCard, TaskEmptyState, TaskFilterTabs are now in task_card_widget.dart)
// ---------------------------------------------------------------------------

// 4-column stats row specific to admin Task Dashboard
class _StatsRow extends StatelessWidget {
  final int total;
  final int pending;
  final int inProgress;
  final int completed;

  const _StatsRow({
    required this.total,
    required this.pending,
    required this.inProgress,
    required this.completed,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Row(
        children: [
          _StatChip(label: 'Total', value: total, color: const Color(0xFF4FC3F7)),
          const SizedBox(width: 8),
          _StatChip(label: 'Pending', value: pending, color: const Color(0xFFFFB300)),
          const SizedBox(width: 8),
          _StatChip(label: 'Active', value: inProgress, color: const Color(0xFF1E88E5)),
          const SizedBox(width: 8),
          _StatChip(label: 'Done', value: completed, color: const Color(0xFF43A047)),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _StatChip({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withAlpha(30),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withAlpha(76), width: 1),
        ),
        child: Column(
          children: [
            Text(
              '$value',
              style: TextStyle(
                color: color,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF666666),
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

class _SearchBar extends StatelessWidget {
  final ValueChanged<String> onChanged;

  const _SearchBar({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: TextField(
        onChanged: onChanged,
        style: const TextStyle(color: Colors.black87, fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Search tasks by title, location or type…',
          hintStyle: const TextStyle(color: Color(0xFF888888), fontSize: 13),
          prefixIcon: const Icon(Icons.search_rounded,
              color: Color(0xFF888888), size: 20),
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide:
                const BorderSide(color: Color(0xFF4FC3F7), width: 1.5),
          ),
        ),
      ),
    );
  }
}