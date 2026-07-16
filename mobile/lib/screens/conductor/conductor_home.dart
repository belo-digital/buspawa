import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:provider/provider.dart';

class ConductorHome extends StatefulWidget {
  const ConductorHome({super.key});

  @override
  State<ConductorHome> createState() => _ConductorHomeState();
}

class _ConductorHomeState extends State<ConductorHome> {
  List<dynamic> _manifest = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadManifest();
  }

  Future<void> _loadManifest() async {
    try {
      final api = context.read<ApiService>();
      final data = await api.get('/tickets/manifest/current-trip-id');
      setState(() {
        _manifest = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _markBoarded(String ticketRef) async {
    final api = context.read<ApiService>();
    await api.patch('/tickets/$ticketRef/board');
    _loadManifest();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Conductor — Trip Manifest')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _manifest.length,
              itemBuilder: (context, index) {
                final p = _manifest[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(p['seatNumber'].toString()),
                  ),
                  title: Text(p['passengerName']),
                  subtitle: Text('Seat ${p['seatNumber']}'),
                  trailing: p['boarded']
                      ? const Icon(Icons.check_circle, color: Colors.green)
                      : FilledButton(
                          onPressed: () => _markBoarded(p['ticketRef']),
                          child: const Text('Board'),
                        ),
                );
              },
            ),
    );
  }
}
