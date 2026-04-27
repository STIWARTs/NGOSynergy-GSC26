import 'package:flutter/material.dart';
import '../features/tasks/screens/task_list_screen.dart';
import '../features/tasks/screens/task_detail_screen.dart';
import '../features/tasks/screens/volunteer_tasks_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/chat/screens/chat_room_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/auth/screens/login_screen.dart';
import 'route_constants.dart';

class AppRoutes {
  static const String home = RouteConstants.home;
  static const String login = RouteConstants.login;
  static const String tasks = RouteConstants.tasks;
  static const String taskDetail = RouteConstants.taskDetail;
  static const String volunteerTasks = RouteConstants.volunteerTasks;
  static const String chatRoom = RouteConstants.chatRoom;
  static const String profile = RouteConstants.profile;

  static Map<String, WidgetBuilder> get routes => {
        home: (context) => const HomeScreen(),
        login: (context) => const LoginScreen(),
        tasks: (context) => const TaskListScreen(),
        taskDetail: (context) => const TaskDetailScreen(),
        volunteerTasks: (context) => const VolunteerTasksScreen(),
        chatRoom: (context) => const ChatRoomScreen(),
        profile: (context) => const ProfileScreen(),
      };
}