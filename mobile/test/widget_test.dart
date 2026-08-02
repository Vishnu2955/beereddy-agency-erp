import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:beereddy_mobile/main.dart';

void main() {
  testWidgets('Beereddy Agency App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: BeereddyAgencyApp(),
      ),
    );
    expect(find.byType(BeereddyAgencyApp), findsOneWidget);
  });
}
