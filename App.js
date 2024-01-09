import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  StatusBar,
  BackHandler,
  ToastAndroid,
} from "react-native";
import {
  Modal,
  Portal,
  PaperProvider,
  TextInput,
  MD3DarkTheme,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { ImagesAssets } from "./assets/ImagesAssets";

const AppButton = ({ onPress, title, disabled }) => (
  <View style={styles.screenContainer}>
    <Pressable onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={disabled ? ["#262626", "#5e5d5d"] : ["#000", "#616163"]}
        style={styles.appButtonContainer}
      >
        <Text
          style={{
            ...styles.appButtonText,
            ...(disabled && { color: "rgba(29, 27, 30, 0.38)" }),
          }}
        >
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  </View>
);

function HomeScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("GameInstructions");
    }, 3000);
  }, []);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Image source={ImagesAssets.logo} />
    </View>
  );
}

function GameInstructions({ navigation }) {
  const [visible, setVisible] = useState(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [numberOfImposters, setNumberOfImposters] = useState("");
  const [playersError, setPlayersError] = useState(false);
  const [impostersError, setImpostersError] = useState(false);
  const [exitApp, setExitApp] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      const backAction = () => {
        setTimeout(() => setExitApp(0), 2000);
        if (exitApp === 0) {
          setExitApp(exitApp + 1);
          ToastAndroid.show(
            "Tap back again to exit the application",
            ToastAndroid.SHORT
          );
        } else if (exitApp === 1) {
          BackHandler.exitApp();
        }
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => backHandler.remove();
    }
  }, [exitApp]);

  return (
    <PaperProvider>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "space-between",
          margin: 10,
        }}
      >
        <Portal>
          <Modal
            theme={{
              colors: {
                backdrop: "rgba(0, 0, 0, 0.7)",
              },
            }}
            visible={visible}
            onDismiss={() => setVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <TextInput
              label="Number of Players"
              onChangeText={(value) => {
                setNumberOfPlayers(value);
                if (Number(value) >= 5 && Number(value) <= 20) {
                  setPlayersError(false);
                } else {
                  setPlayersError(true);
                }
              }}
              value={numberOfPlayers}
              keyboardType="numeric"
              maxLength={2}
              error={playersError}
              caretHidden={true}
              autoFocus={true}
              theme={{ ...MD3DarkTheme }}
              underlineColor="#262626"
              activeUnderlineColor="#1f1e1e"
              style={!playersError && { marginBottom: 20 }}
            />
            {playersError && (
              <Text style={{ margin: 5, color: "rgb(186, 26, 26)" }}>
                {numberOfPlayers < 5
                  ? "Minimum number of players are 5"
                  : "Maximum number of players are 20"}
              </Text>
            )}
            <TextInput
              label="Number of Mafioso(s)"
              onChangeText={(value) => {
                setNumberOfImposters(value);
                if (Number(value) >= 1 && Number(value) <= 5) {
                  setImpostersError(false);
                } else {
                  setImpostersError(true);
                }
              }}
              value={numberOfImposters}
              keyboardType="numeric"
              maxLength={1}
              error={impostersError}
              caretHidden={true}
              theme={{ ...MD3DarkTheme }}
              underlineColor="#262626"
              activeUnderlineColor="#1f1e1e"
              style={!impostersError && { marginBottom: 20 }}
            />
            {impostersError && (
              <Text style={{ margin: 5, color: "rgb(186, 26, 26)" }}>
                {numberOfImposters < 1
                  ? "Minimum number of mafioso is 1"
                  : "Maximum number of mafiosos are 5"}
              </Text>
            )}
            <AppButton
              title="Start"
              onPress={() => {
                navigation.numberOfPlayers;
                navigation.numberOfImposters;
                navigation.navigate("GameScreen", {
                  numberOfPlayers,
                  numberOfImposters,
                });
              }}
              disabled={
                playersError ||
                impostersError ||
                numberOfImposters === "" ||
                numberOfPlayers === ""
              }
            />
          </Modal>
        </Portal>
        <View
          style={{
            flex: 1,
            marginTop: 10,
            marginLeft: 8,
            alignSelf: "flex-start",
            justifyItems: "flex-start",
          }}
        >
          <Text style={styles.header}>Game Instructions:</Text>
          <Text style={{ marginStart: 10 }}>Game detailed Instructions</Text>
        </View>
        <AppButton title="Start a Game" onPress={() => setVisible(true)} />
      </View>
    </PaperProvider>
  );
}

function GameScreen({ navigation }) {
  const route = useRoute();
  const { numberOfPlayers, numberOfImposters } = route.params;
  const [playerTurn, setPlayerTurn] = useState(0);
  const [visible, setVisible] = useState(false);
  const [players, setPlayers] = useState(Array(numberOfPlayers));
  useEffect(() => {
    const getShuffledArr = (arr) => {
      const newArr = arr.slice();
      for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
      }
      return newArr;
    };
    const game = getShuffledArr([
      ...Array(Number(numberOfImposters)).fill("mafioso"),
      ...Array(numberOfPlayers - numberOfImposters - 1).fill("villager"),
      "doctor",
    ]);
    setPlayers(game);
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {playerTurn >= 0 && (
          <Portal>
            <Modal
              theme={{
                colors: {
                  backdrop: "rgba(0, 0, 0, 0.7)",
                },
              }}
              visible={visible}
              onDismiss={() => {
                if (playerTurn === players.length - 1) {
                  setPlayerTurn(-1);
                } else {
                  setPlayerTurn(playerTurn + 1);
                }
                setVisible(false);
              }}
              contentContainerStyle={{
                ...styles.modal,
                justifyContent: "space-around",
              }}
            >
              <Image
                style={{ alignSelf: "center" }}
                source={ImagesAssets[players[playerTurn]]}
              />
              <Text
                style={{
                  ...styles.header,
                  alignSelf: "center",
                }}
              >
                Player {playerTurn + 1} is a{" "}
                <Text
                  style={{
                    ...(players[playerTurn] === "mafioso" && {
                      color: "#800404",
                    }),
                  }}
                >
                  {players[playerTurn][0].toUpperCase() +
                    players[playerTurn].slice(1)}
                </Text>
                .
              </Text>
            </Modal>
          </Portal>
        )}
        <AppButton
          title={
            playerTurn === -1
              ? "Play Again"
              : "Player's " + (playerTurn + 1) + " turn"
          }
          onPress={() => {
            if (playerTurn === -1) {
              navigation.navigate("GameInstructions");
            } else {
              setVisible(true);
            }
          }}
        />
      </View>
    </PaperProvider>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#808080" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GameInstructions" component={GameInstructions} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
      </Stack.Navigator>
      <StatusBar hidden={true} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appButtonContainer: {
    elevation: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 250,
    margin: 10,
  },
  appButtonText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
    padding: 10,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
  },
  modal: { backgroundColor: "#808080", padding: 20, margin: 20, height: 280 },
});
