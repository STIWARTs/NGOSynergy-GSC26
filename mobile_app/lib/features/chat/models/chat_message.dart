// features/chat/models/chat_message.dart
enum MessageType { text, image, file }

class ChatMessage {
  final String id;
  final String text;
  final String senderId;
  final String senderName;
  final DateTime timestamp;
  final MessageType type;

  const ChatMessage({
    required this.id,
    required this.text,
    required this.senderId,
    required this.senderName,
    required this.timestamp,
    this.type = MessageType.text,
  });

  bool get isMe => senderId == 'volunteer_1'; // Hardcoded for MVP
}
