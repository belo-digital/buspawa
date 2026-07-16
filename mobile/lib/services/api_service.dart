import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/foundation.dart';

class ApiService extends ChangeNotifier {
  String? _token;
  String _baseUrl = 'http://localhost:3000/api';

  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<void> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode == 201 || res.statusCode == 200) {
      final data = jsonDecode(res.body);
      _token = data['token'];
      notifyListeners();
    } else {
      throw Exception('Login failed');
    }
  }

  Future<dynamic> get(String path) async {
    final res = await http.get(Uri.parse('$_baseUrl$path'), headers: _headers);
    return jsonDecode(res.body);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body}) async {
    final res = await http.post(
      Uri.parse('$_baseUrl$path'),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return jsonDecode(res.body);
  }

  Future<dynamic> patch(String path, {Map<String, dynamic>? body}) async {
    final res = await http.patch(
      Uri.parse('$_baseUrl$path'),
      headers: _headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return jsonDecode(res.body);
  }

  void setBaseUrl(String url) {
    _baseUrl = url;
  }
}
