import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:provider/provider.dart';

class AgentHome extends StatefulWidget {
  const AgentHome({super.key});

  @override
  State<AgentHome> createState() => _AgentHomeState();
}

class _AgentHomeState extends State<AgentHome> {
  List<dynamic> _trips = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    try {
      final api = context.read<ApiService>();
      final data = await api.get('/fleet/trips?status=scheduled');
      setState(() {
        _trips = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking Agent')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _trips.length,
              itemBuilder: (context, index) {
                final trip = _trips[index];
                return Card(
                  margin: const EdgeInsets.all(8),
                  child: ListTile(
                    title: Text(trip['route']),
                    subtitle: Text('${trip['departureTime']} • ${trip['vehicle']?['registration'] ?? ''}'),
                    trailing: Text('${trip['totalSeats'] - trip['bookedSeats']} seats'),
                  ),
                );
              },
            ),
    );
  }
}
