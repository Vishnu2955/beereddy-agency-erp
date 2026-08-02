import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WebAppScreen extends StatefulWidget {
  const WebAppScreen({super.key});

  @override
  State<WebAppScreen> createState() => _WebAppScreenState();
}

class _WebAppScreenState extends State<WebAppScreen> {
  WebViewController? _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  int _loadingProgress = 0;
  String _currentServerUrl = 'http://192.168.16.103:5000';
  final TextEditingController _urlInputController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Set status bar & navigation bar transparent/dark for full-screen immersive web view
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: Color(0xFF0F172A),
        systemNavigationBarIconBrightness: Brightness.light,
      ),
    );
    _initControllerAndLoadUrl();
  }

  Future<void> _initControllerAndLoadUrl() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString('custom_server_url');
      if (savedUrl != null && savedUrl.trim().isNotEmpty) {
        _currentServerUrl = savedUrl.trim();
      }
    } catch (_) {}

    _urlInputController.text = _currentServerUrl;

    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F172A))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              setState(() {
                _loadingProgress = progress;
                _isLoading = progress < 100;
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _hasError = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            if (mounted) {
              // Catch connection failures and prevent raw webview error page
              debugPrint('WebResourceError: ${error.errorCode} - ${error.description}');
              setState(() {
                _isLoading = false;
                _hasError = true;
                _errorMessage = error.description.isNotEmpty
                    ? error.description
                    : 'Unable to connect to Beereddy ERP Server at $_currentServerUrl';
              });
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_currentServerUrl));

    if (mounted) {
      setState(() {
        _controller = controller;
      });
    }
  }

  Future<void> _saveAndLoadUrl(String newUrl) async {
    String formattedUrl = newUrl.trim();
    if (formattedUrl.isEmpty) return;

    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'http://$formattedUrl';
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('custom_server_url', formattedUrl);
    } catch (_) {}

    setState(() {
      _currentServerUrl = formattedUrl;
      _hasError = false;
      _isLoading = true;
    });

    _controller?.loadRequest(Uri.parse(formattedUrl));
  }

  void _showChangeUrlDialog() {
    _urlInputController.text = _currentServerUrl;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.dns_rounded, color: Colors.amber, size: 24),
            SizedBox(width: 10),
            Text(
              'ERP Server Connection',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter your laptop or server IP address / domain:',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _urlInputController,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.url,
              decoration: InputDecoration(
                hintText: 'http://192.168.1.100:5000',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Colors.amber, width: 2),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Colors.white24),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              '💡 Tip: Make sure your phone and laptop are connected to the same Wi-Fi network, or use a public domain URL.',
              style: TextStyle(color: Colors.amber, fontSize: 11, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(context);
              _saveAndLoadUrl(_urlInputController.text);
            },
            child: const Text('Connect Now', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(
          child: CircularProgressIndicator(color: Colors.amber),
        ),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, dynamic result) async {
        if (didPop) return;
        if (_controller != null && await _controller!.canGoBack()) {
          _controller!.goBack();
        } else {
          if (context.mounted) {
            Navigator.of(context).maybePop();
          }
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        body: SafeArea(
          top: false, // Allow full screen under status bar just like desktop web view
          bottom: true,
          child: Stack(
            children: [
              Column(
                children: [
                  if (_isLoading)
                    LinearProgressIndicator(
                      value: _loadingProgress > 0 ? _loadingProgress / 100.0 : null,
                      backgroundColor: const Color(0xFF1E293B),
                      color: Colors.amber,
                      minHeight: 3,
                    ),
                  Expanded(
                    child: _hasError
                        ? _buildErrorScreen()
                        : RefreshIndicator(
                            onRefresh: () async {
                              await _controller?.reload();
                            },
                            color: Colors.amber,
                            backgroundColor: const Color(0xFF1E293B),
                            child: WebViewWidget(controller: _controller!),
                          ),
                  ),
                ],
              ),
              // Floating discreet server config button on bottom right corner if ever needed
              if (!_hasError)
                Positioned(
                  bottom: 16,
                  right: 16,
                  child: Opacity(
                    opacity: 0.85,
                    child: FloatingActionButton.small(
                      heroTag: 'server_config_btn',
                      backgroundColor: const Color(0xFF1E293B),
                      foregroundColor: Colors.amber,
                      elevation: 4,
                      tooltip: 'Change Server IP',
                      onPressed: _showChangeUrlDialog,
                      child: const Icon(Icons.settings, size: 20),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorScreen() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      color: const Color(0xFF0F172A),
      width: double.infinity,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.wifi_off_rounded, color: Colors.amber, size: 56),
          ),
          const SizedBox(height: 24),
          const Text(
            'Cannot Connect to ERP Server',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Target Server: $_currentServerUrl',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.amber, fontSize: 14, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 12),
          const Text(
            'Please ensure your laptop server is running and your mobile phone is connected to the same network.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white60, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 28),
          Column(
            children: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.edit_location_alt_rounded),
                  label: const Text(
                    'Enter Laptop IP / Connect',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  onPressed: _showChangeUrlDialog,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white30),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Try Again'),
                  onPressed: () {
                    setState(() {
                      _hasError = false;
                      _isLoading = true;
                    });
                    _controller?.loadRequest(Uri.parse(_currentServerUrl));
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
