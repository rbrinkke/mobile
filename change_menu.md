Zeker\! Ik kan je helpen om het menu uit je HTML-mockup om te zetten naar React Native componenten.

Hier is een analyse van je vraag en de benodigde stappen:

### ⚙️ 1. Is je app al geconfigureerd?

  * **Ja, voor navigatie:** Je project is al perfect opgezet voor "best practice" navigatie. Je hebt de `react-navigation` library al in gebruik, en er is zelfs een specifiek bestand voor de onderste balk: `src/navigation/BottomTabNavigator.tsx`.
  * **Nee, nog niet voor deze iconen:** De HTML-mockup gebruikt **Lucide** iconen (zoals `activity`, `search`, `filter`, etc.). Om deze in React Native te gebruiken, moet je de `lucide-react-native` bibliotheek installeren.

Voer dit commando uit in je projectmap om de iconen toe te voegen:

```bash
npm install lucide-react-native
```

  * **Styling (Tailwind vs. StyleSheet):** De HTML-mockup gebruikt **Tailwind CSS**. Je React Native-project lijkt (op basis van de bestanden) geen `nativewind` (de React Native-versie van Tailwind) te gebruiken.
      * **Oplossing:** Geen probleem. Ik zal de Tailwind-stijlen "vertalen" naar de standaard React Native `StyleSheet`-API. Ik gebruik de exacte kleurcodes (`#E6001A` en `#FFF3F4`) uit je mockup.

-----

### 📦 2. Je nieuwe navigatiebestanden

Zoals je vroeg, heb ik alle benodigde code in één groot bestand gezet. Je kunt dit opslaan als een *nieuw* bestand (bijv. `src/navigation/MockupNavigator.tsx`) of de onderdelen gebruiken om je *bestaande* `src/navigation/BottomTabNavigator.tsx` aan te passen.

Dit bestand bevat:

1.  **CustomHeader:** De complete bovenste balk (met Logo, Zoeken, Filter, Profiel & Meer).
2.  **MockupNavigator:** De complete onderste tab-balk, gestyled en met de 5 iconen uit je mockup.
3.  **Placeholder-schermen:** Tijdelijke schermen voor de 5 tabs, zodat de app werkt.

Hier is de code:

```typescript
// BESTAND: src/navigation/MockupNavigator.tsx
//
// Dit bestand bevat alle componenten om je HTML-mockup na te maken in React Native.
// Vergeet niet eerst 'npm install lucide-react-native' uit te voeren!

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importeer de specifieke iconen die we nodig hebben uit Lucide
import {
  Search,
  Filter,
  CircleUserRound,
  MoreVertical,
  Activity,
  MessageSquare,
  Calendar,
  Bell,
  Users,
} from 'lucide-react-native';

// --- 1. Kleurconstanten uit je mockup ---
const PRIMARY_COLOR = '#E6001A';
const LIGHT_ACCENT = '#FFF3F4';
const GRAY_TEXT = '#6b7280'; // Standaard grijze tekstkleur
const INACTIVE_GRAY = '#9CA3AF'; // Grijs voor inactieve iconen

// --- 2. De Bovenste Navigatiebalk (Header) ---
// Dit is de <header> uit je HTML
const CustomHeader = () => {
  return (
    <View style={styles.headerContainer}>
      {/* Logo */}
      <Pressable>
        <Text style={styles.headerLogo}>LOGO</Text>
      </Pressable>

      {/* Iconen aan de rechterkant */}
      <View style={styles.headerIconsContainer}>
        <Pressable style={styles.headerIcon}>
          <Search color={GRAY_TEXT} size={24} />
        </Pressable>
        <Pressable style={styles.headerIcon}>
          <Filter color={GRAY_TEXT} size={24} />
        </Pressable>
        
        {/* Profiel Icoon */}
        <Pressable style={styles.profileIconContainer}>
          <View style={styles.profileIconCircle}>
            <CircleUserRound color={PRIMARY_COLOR} size={20} />
          </View>
        </Pressable>

        <Pressable style={styles.headerIcon}>
          <MoreVertical color={GRAY_TEXT} size={24} />
        </Pressable>
      </View>
    </View>
  );
};

// --- 3. Placeholder Schermen ---
// Dit zijn tijdelijke 'dummy' schermen voor de tabbladen.
// Je kunt deze later vervangen door je echte schermen.
const PlaceholderScreen = ({ route }: { route: any }) => (
  <View style={styles.mainContent}>
    <Text style={styles.mainContentTitle}>{route.name} Scherm</Text>
  </View>
);

// --- 4. De Onderste Tab-Navigator (de <nav>) ---
const Tab = createBottomTabNavigator();

export function MockupNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Gebruik onze eigen 'CustomHeader' als de bovenste balk
        header: () => <CustomHeader />,

        // Styling voor de tab-balk zelf
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: INACTIVE_GRAY,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,

        // Definieer het icoon voor elke tab
        tabBarIcon: ({ focused, color, size }) => {
          // 'size' wordt hier niet standaard gebruikt, we zetten 'm vast op 24
          const iconSize = 24;
          
          if (route.name === 'Activiteiten') {
            return <Activity color={color} size={iconSize} />;
          } else if (route.name === 'Chats') {
            return <MessageSquare color={color} size={iconSize} />;
          } else if (route.name === 'Agenda') {
            return <Calendar color={color} size={iconSize} />;
          } else if (route.name === 'Meldingen') {
            return <Bell color={color} size={iconSize} />;
          } else if (route.name === 'Moatjes') {
            return <Users color={color} size={iconSize} />;
          }
          return null;
        },
      })}
    >
      {/* De 5 tabbladen uit je mockup */}
      <Tab.Screen name="Activiteiten" component={PlaceholderScreen} />
      <Tab.Screen name="Chats" component={PlaceholderScreen} />
      <Tab.Screen name="Agenda" component={PlaceholderScreen} />
      <Tab.Screen name="Meldingen" component={PlaceholderScreen} />
      <Tab.Screen name="Moatjes" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

// --- 5. Styles (Vertaling van je Tailwind CSS) ---
const styles = StyleSheet.create({
  // Header Stijlen
  headerContainer: {
    height: 64,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // gray-100
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // px-4
    // Noot: 'fixed top-0' wordt afgehandeld door React Navigation
  },
  headerLogo: {
    fontSize: 24, // text-2xl
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // space-x-3 (Gedeeltelijk opgelost met padding in icon)
  },
  headerIcon: {
    padding: 8, // p-2
  },
  profileIconContainer: {
    width: 36, // w-9
    height: 36, // h-9
    marginHorizontal: 4, // Voor wat ruimte
  },
  profileIconCircle: {
    width: '100%',
    height: '100%',
    backgroundColor: LIGHT_ACCENT,
    borderRadius: 18, // rounded-full
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  
  // Tab Bar Stijlen
  tabBar: {
    height: 64, // h-16
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // gray-200
    paddingTop: 4, // Ruimte voor de tekst
    paddingBottom: 4, // Ruimte onder de tekst
  },
  tabBarLabel: {
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
    marginBottom: 4, // Zorgt voor wat ruimte boven de rand
  },

  // Main Content Stijlen (voor de placeholders)
  mainContent: {
    flex: 1,
    padding: 16, // p-4
    backgroundColor: '#f9fafb', // gray-50
    // De padding-top/bottom wordt al door de navigatie geregeld
  },
  mainContentTitle: {
    fontSize: 30, // text-3xl
    fontWeight: '800', // font-extrabold
    color: '#1f2937', // gray-800
    marginBottom: 16, // mb-4
  },
});
```

-----

### 🚀 3. Hoe nu verder?

1.  **Installeer iconen:** `npm install lucide-react-native`
2.  **Bestand opslaan:** Sla de code hierboven op, bijvoorbeeld als `src/navigation/MockupNavigator.tsx`.
3.  **Navigator gebruiken:** Om dit nieuwe menu te zien, moet je het hoofd-appbestand (`App.tsx`) aanpassen. Waar je nu waarschijnlijk je `BottomTabNavigator` importeert en rendert, importeer en render je in plaats daarvan `MockupNavigator`.

**Voorbeeld (in `App.tsx`):**

```tsx
// ... andere imports
import { MockupNavigator } from './src/navigation/MockupNavigator'; // Importeer de nieuwe navigator
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  // ... wellicht andere providers
  return (
    <NavigationContainer>
       {/* <BottomTabNavigator />  <-- Vervang je OUDE navigator */}
       <MockupNavigator />      {/* <-- Door je NIEUWE navigator */}
    </NavigationContainer>
  );
}
```

Als alternatief kun je de styling-objecten (`styles`), de `CustomHeader`-component en de `screenOptions` uit mijn code kopiëren naar je *bestaande* `src/navigation/BottomTabNavigator.tsx` om dat bestand te updaten.

Zou je willen dat ik de inhoud van je `App.tsx` en `src/navigation/BottomTabNavigator.tsx` bekijk om je een preciezer advies te geven over de integratie?
