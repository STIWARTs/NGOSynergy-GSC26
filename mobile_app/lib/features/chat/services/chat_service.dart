// features/chat/services/chat_service.dart
import 'dart:async';
import '../models/chat_message.dart';

class ChatService {
  // Singleton pattern
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal();

  final List<ChatMessage> _messages = [
    ChatMessage(
      id: 'msg_1',
      text: 'Hello everyone! I have reached Sector 12 for the insulin delivery.',
      senderId: 'volunteer_1',
      senderName: 'Piyush',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
    ),
    ChatMessage(
      id: 'msg_2',
      text: 'Great. Let us know if you need any assistance.',
      senderId: 'admin_1',
      senderName: 'Admin System',
      timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
    ),
    ChatMessage(
      id: 'msg_3',
      text: 'Are there enough food packets in the North Zone?',
      senderId: 'volunteer_2',
      senderName: 'Rahul',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
  ];

  // Stream controller to simulate real-time updates
  final _messageController = StreamController<List<ChatMessage>>.broadcast();

  Stream<List<ChatMessage>> get messagesStream {
    // Emit initial values immediately
    Future.microtask(() => _messageController.add(List.unmodifiable(_messages)));
    return _messageController.stream;
  }

  void sendMessage(String text) {
    if (text.trim().isEmpty) return;
    
    final newMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text.trim(),
      senderId: 'volunteer_1', // MVP hardcode
      senderName: 'Piyush',    // MVP hardcode
      timestamp: DateTime.now(),
      type: MessageType.text,
    );

    _messages.add(newMessage);
    _messageController.add(List.unmodifiable(_messages));
  }
  
  void dispose() {
    _messageController.close();
  }
}
