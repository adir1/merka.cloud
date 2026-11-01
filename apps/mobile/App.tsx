import { PROTOCOL_VERSION } from "@merka/core";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merka.cloud</Text>
      <Text>Mobile app scaffold</Text>
      <Text>Shared protocol v{PROTOCOL_VERSION}</Text>
      <Text>On-device inference will use llama.rn.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
});
