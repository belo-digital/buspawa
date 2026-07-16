import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/api_service.dart';
import 'screens/conductor/conductor_home.dart';
import 'screens/agent/agent_home.dart';
import 'screens/customer/customer_home.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => ApiService(),
      child: const BusPawaApp(),
    ),
  );
}

class BusPawaApp extends StatelessWidget {
  const BusPawaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BusPawa',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1D4ED8),
        useMaterial3: true,
      ),
      home: const AppSelector(),
    );
  }
}

class AppSelector extends StatelessWidget {
  const AppSelector({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'BusPawa',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 48),
            _AppButton(
              label: 'Conductor App',
              icon: Icons.badge,
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ConductorHome())),
            ),
            const SizedBox(height: 16),
            _AppButton(
              label: 'Booking Agent',
              icon: Icons.point_of_sale,
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AgentHome())),
            ),
            const SizedBox(height: 16),
            _AppButton(
              label: 'Customer App',
              icon: Icons.person,
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CustomerHome())),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _AppButton({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 250,
      height: 56,
      child: FilledButton.icon(
        icon: Icon(icon),
        label: Text(label, style: const TextStyle(fontSize: 16)),
        onPressed: onTap,
      ),
    );
  }
}
