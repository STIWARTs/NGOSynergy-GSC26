import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/task_service.dart';
import '../models/task_item.dart';
import '../widgets/task_card_widget.dart';

class TaskMapScreen extends StatefulWidget {
  const TaskMapScreen({super.key});

  @override
  State<TaskMapScreen> createState() => _TaskMapScreenState();
}

class _TaskMapScreenState extends State<TaskMapScreen> {
  final _taskService = TaskService();
  GoogleMapController? _mapController;

  // Initial camera position (defaulting to a central point, will update when tasks load)
  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(21.223, 81.687), // Raipur center as default
    zoom: 12,
  );

  Set<Marker> _buildMarkers(List<TaskItem> tasks) {
    return tasks.map((task) {
      return Marker(
        markerId: MarkerId(task.id),
        position: LatLng(task.coordinates.lat, task.coordinates.lng),
        infoWindow: InfoWindow(
          title: task.title,
          snippet: '${task.severity.label} • ${task.type.label}',
          onTap: () => _showTaskDetails(task),
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          _getMarkerHue(task.severity),
        ),
      );
    }).toSet();
  }

  double _getMarkerHue(TaskSeverity severity) {
    switch (severity) {
      case TaskSeverity.critical:
        return BitmapDescriptor.hueRed;
      case TaskSeverity.high:
        return BitmapDescriptor.hueOrange;
      case TaskSeverity.medium:
        return BitmapDescriptor.hueYellow;
      case TaskSeverity.low:
        return BitmapDescriptor.hueGreen;
    }
  }

  void _showTaskDetails(TaskItem task) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.4,
        maxChildSize: 0.6,
        minChildSize: 0.3,
        builder: (_, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    TaskCard(task: task),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Incident Map'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListenableBuilder(
        listenable: _taskService,
        builder: (context, _) {
          final tasks = _taskService.getAllTasks();
          return GoogleMap(
            initialCameraPosition: _initialPosition,
            markers: _buildMarkers(tasks),
            onMapCreated: (controller) => _mapController = controller,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            mapToolbarEnabled: true,
            zoomControlsEnabled: false,
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await _taskService.fetchTasks();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Map updated with latest incidents')),
          );
        },
        child: const Icon(Icons.refresh_rounded),
      ),
    );
  }
}
