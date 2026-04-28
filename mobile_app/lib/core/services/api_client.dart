// lib/core/services/api_client.dart
//
// Thin HTTP client for the NGO backend.
// - Reads base URL from .env via flutter_dotenv.
// - Automatically attaches the Firebase ID token as a Bearer header.
// - Throws descriptive exceptions on non-2xx responses.

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'auth_service.dart';

class ApiClient {
  static final _auth = AuthService();

  static String get _base => dotenv.get('API_BASE_URL');

  static Future<Map<String, String>> _headers() async {
    final token = await _auth.getIdToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// HTTP GET — returns decoded JSON (Map or List).
  static Future<dynamic> get(String path) async {
    final res = await http.get(
      Uri.parse('$_base$path'),
      headers: await _headers(),
    );
    _check(res);
    return jsonDecode(res.body);
  }

  /// HTTP PATCH — sends [body] as JSON, returns decoded response.
  static Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final res = await http.patch(
      Uri.parse('$_base$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    _check(res);
    return jsonDecode(res.body);
  }

  /// HTTP POST — sends [body] as JSON, returns decoded response.
  static Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('$_base$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    _check(res);
    return jsonDecode(res.body);
  }

  static void _check(http.Response res) {
    if (res.statusCode == 401) {
      throw Exception('Unauthorized — please log in again');
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('API error ${res.statusCode}: ${res.body}');
    }
  }
}
