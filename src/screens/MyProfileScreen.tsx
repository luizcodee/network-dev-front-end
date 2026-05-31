import {View,Text,StyleSheet,Image,TouchableOpacity,ScrollView,TextInput,ImageBackground,Alert,ActivityIndicator,Platform,} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useState, useEffect } from "react";

import Ionicons from "react-native-vector-icons/Ionicons";

import * as ImagePicker from 'expo-image-picker';

import { api } from "../services/api";

import { getStoredUserId } from "../services/auth";

import { useResponsive } from "../utils/responsive";

import { useIsFocused } from "@react-navigation/native"; // alterado agora para teste


export default function MyProfileScreen({ navigation }: any) {

  const [isEditing, setIsEditing] = useState(false);



  const [showStacks, setShowStacks] = useState(false);



  const stackOptions = [

    {

      category: "Front-End",

      items: [

        "React",

        "Angular",

        "Vue.js",

        "JavaScript",

        "TypeScript",

      ],

    },



    {

      category: "Back-End",

      items: [

        "Java",

        "Spring Boot",

        "C#",

        ".NET",

        "Node.js",

        "Python",

        "PHP",

      ],

    },



    {

      category: "Mobile",

      items: [

        "Flutter",

        "React Native",

        "Swift",

      ],

    },



    {

      category: "Cloud & DevOps",

      items: [

        "AWS",

        "Docker",

        "Kubernetes",

      ],

    },



    {

      category: "Banco de Dados",

      items: [

        "MongoDB",

        "SQL",

        "PostgreSQL",

      ],

    },



    {

      category: "UX/UI",

      items: [

        "Figma",

        "Photoshop",

      ],

    },

  ];



  const stackIcons: any = {

    React: require("../assets/stacks/react.png"),

    "React Native": require("../assets/stacks/reactnative.png"),

    Angular: require("../assets/stacks/angular.png"),

    "Vue.js": require("../assets/stacks/vuejs.png"),

    JavaScript: require("../assets/stacks/javascript.png"),

    TypeScript: require("../assets/stacks/typescript.png"),

    Java: require("../assets/stacks/java.png"),

    "Spring Boot": require("../assets/stacks/springboot.png"),

    "C#": require("../assets/stacks/csharp.png"),

    ".NET": require("../assets/stacks/dot-net.png"),

    "Node.js": require("../assets/stacks/nodejs.png"),

    Python: require("../assets/stacks/python.png"),

    PHP: require("../assets/stacks/php.png"),

    Flutter: require("../assets/stacks/flutter.png"),

    Swift: require("../assets/stacks/swift.png"),

    AWS: require("../assets/stacks/aws.png"),

    Docker: require("../assets/stacks/docker.png"),

    Kubernetes: require("../assets/stacks/kubernetes.png"),

    MongoDB: require("../assets/stacks/mongodb.png"),

    SQL: require("../assets/stacks/mysql.png"),

    PostgreSQL: require("../assets/stacks/postgresql.png"),

    Figma: require("../assets/stacks/figma.png"),

    Photoshop: require("../assets/stacks/photoshop.png"),

  };



  const [loading, setLoading] = useState(false);

  const {

  isMobile,

  isTablet,

  isDesktop,

} = useResponsive();

  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("Joice Barbosa");



  const [position, setPosition] = useState(

    "Desenvolvedora Mobile"

  );



  const [objective, setObjective] = useState(

    "Buscando networking e oportunidades em mobile e IoT."

  );



  const [bio, setBio] = useState(

    "Apaixonada por tecnologia, desenvolvimento mobile e soluções IoT."

  );

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);



  const [selectedStacks, setSelectedStacks] = useState<string[]>([

    "React Native",

    "TypeScript",

    "Java",

  ]);



//  useEffect(() => {

//    loadUserData();

//  }, []);

  const isFocused = useIsFocused(); // add agora para teste 

useEffect(() => {
  if (isFocused) {
    loadUserData();
  }
}, [isFocused]);



  async function loadUserData() {

    try {

      const id = await getStoredUserId();

      if (!id) return;

      setUserId(id);

      const response = await api.get(`/users/${id}`);

      setName(response.data.name);

      setPosition(response.data.position || "");

      setBio(response.data.bio || "");

      setProfileImageUrl(response.data.profileImageUrl || null);

      if (response.data.stack) {

        setSelectedStacks(response.data.stack.split(", "));

      }

    } catch (error) {

      console.log("Erro ao carregar perfil", error);

    }

  }



  function toggleStack(stack: string) {

    if (selectedStacks.includes(stack)) {

      setSelectedStacks(

        selectedStacks.filter((item) => item !== stack)

      );

    } else {

      setSelectedStacks([...selectedStacks, stack]);

    }

  }



  async function handleSave() {

    setLoading(true);

    try {

      const id = await getStoredUserId();

      await api.put(`/users/${id}`, {

        name,

        bio,

        stack: selectedStacks.join(", "),

        position,

        uuidBluetooth: `PROXNET_${name.replace(/\s/g, '_')}_${id}`

      });



      Alert.alert("Sucesso", "Perfil atualizado 🚀");



      await loadUserData();



      setIsEditing(false);

 

    } catch (error) {

      Alert.alert("Erro", "Não foi possível salvar as alterações.");

    } finally {

      setLoading(false);

    }

  }



  async function handlePickImage() {

    const result = await ImagePicker.launchImageLibraryAsync({

      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,

      aspect: [1, 1],

      quality: 0.7,

    });



    if (!result.canceled) {

      uploadAvatar(result.assets[0].uri);

    }

  }



async function uploadAvatar(uri: string) {

  setLoading(true);

  try {

    const id = await getStoredUserId();

    const formData = new FormData();



    if (Platform.OS === 'web') {

      // 1. ADICIONADO: Busca a imagem da URI e converte em Blob real

      const response = await fetch(uri);

      const blob = await response.blob();

     

      // Correção do TypeScript para aceitar os 3 argumentos na Web

      (formData as any).append('file', blob, 'avatar.jpg');

    } else {

      // Tratamento para Mobile (iOS / Android)

      const uriToUpload = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

      formData.append('file', {

        uri: uriToUpload,

        type: 'image/jpeg',

        name: 'avatar.jpg',

      } as any);

    }



    // 2. Envia para o Back-end sem o Content-Type manual (o Axios resolve automático)

    await api.post(`/users/${id}/upload-profile-image`, formData);



    Alert.alert("Sucesso", "Foto de perfil atualizada!");

    await loadUserData(); // add para teste agora


  } catch (error) {

    console.error("Erro no upload de avatar:", error);

  } finally {

    setLoading(false);

  }

}



  return (

    <ImageBackground

      source={require("../assets/network-bg.png")}

      style={[

        styles.background,

        {

          width: "100%",

          minHeight: "100%",

        },

      ]}

    >

      <View style={styles.overlay}>

        <SafeAreaView

          style={[

            styles.container,

            {

              paddingHorizontal: isMobile ? 20 : 40,

              maxWidth: isDesktop ? 1200 : 900,

              width: "100%",

              alignSelf: "center",

            },

          ]}

        >

          <ScrollView showsVerticalScrollIndicator={false}>



            {/* TOP BAR */}

            <View

              style={[

                styles.topBar,

                {

                  marginBottom: isMobile ? 24 : 34,

                },

              ]}

            >



              <TouchableOpacity

                onPress={() => {

                  if (navigation.canGoBack()) {

                    navigation.goBack();

                  } else {

                    navigation.navigate("Home");

                  }

                }}

              >

                <Text style={styles.backText}>

                  ← Voltar

                </Text>

              </TouchableOpacity>



            </View>



            {/* AVATAR */}

            <View style={styles.avatarContainer}>



              <View>



                <Image

                  source={{

                    uri: profileImageUrl || "https://i.pravatar.cc/300?img=32",

                  }}

                  style={[

                    styles.avatar,

                    {

                      width: isMobile ? 110 : 150,

                      height: isMobile ? 110 : 150,

                      borderRadius: isMobile ? 55 : 75,

                    },

                  ]}

                />



                {isEditing && (

                  <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>

                    <Ionicons

                      name="camera-outline"

                      size={20}

                      color="#fff"

                    />

                  </TouchableOpacity>

                )}



              </View>



              {isEditing && (

                <Text style={styles.changePhotoText}>

                  Alterar foto

                </Text>

              )}



              {!isEditing && (

                <>

                  <Text

                    style={[

                      styles.profileName,

                      {

                        fontSize: isMobile ? 22 : 34,

                      }

                    ]}

                  >

                    {name}

                  </Text>



                  <Text

                    style={[

                      styles.profilePosition,

                      {

                        fontSize: isMobile ? 16 : 20,

                      }

                    ]}

                  >

                    {position}

                  </Text>

                </>

              )}



            </View>



            {/* STACKS VISUALIZAÇÃO */}

            {!isEditing && (

              <View

                style={[

                  styles.stackContainer,

                  {

                    maxWidth: isDesktop ? 900 : "100%",

                    alignSelf: "center",

                  },

                ]}

              >

                {selectedStacks.map((stack) => (

                  <View key={stack} style={styles.techCard}>



                    <Image

                      source={stackIcons[stack]}

                      style={styles.techIcon}

                    />



                    <Text style={styles.techText}>

                      {stack}

                    </Text>



                  </View>

                ))}

              </View>

            )}



            {/* VISUALIZAÇÃO */}

            {!isEditing && (

              <>



                {/* ABOUT */}

                <View

                  style={[

                    styles.infoCard,

                    {

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >



                  <View style={styles.cardContent}>



                    <View style={styles.iconCircle}>

                      <Ionicons

                        name="person-outline"

                        size={22}

                        color="#4DA6FF"

                      />

                    </View>



                    <View style={styles.textContent}>



                      <Text style={styles.infoTitle}>

                        Sobre mim

                      </Text>



                      <Text style={styles.infoText}>

                        {bio}

                      </Text>



                    </View>



                  </View>



                </View>



                {/* OBJETIVO */}

                <View

                  style={[

                    styles.infoCard,

                    {  

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >



                  <View style={styles.cardContent}>



                    <View style={styles.iconCircle}>

                      <Ionicons

                        name="compass-outline"

                        size={22}

                        color="#4DA6FF"

                      />

                    </View>



                    <View style={styles.textContent}>



                      <Text style={styles.infoTitle}>

                        Objetivo

                      </Text>



                      <Text style={styles.infoText}>

                        {objective}

                      </Text>



                    </View>



                  </View>



                </View>



                {/* BLE */}

                <View

                  style={[

                    styles.infoCard,

                    {

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >



                  <View style={styles.cardContent}>



                    <View style={styles.iconCircle}>

                      <Ionicons

                        name="bluetooth-outline"

                        size={22}

                        color="#4DA6FF"

                      />

                    </View>



                    <View style={styles.textContent}>



                      <Text style={styles.infoTitle}>

                        Status BLE

                      </Text>



                      <View style={styles.bleRow}>

                        <View style={styles.greenDot} />



                        <Text style={styles.bleText}>

                          ESP32 conectado

                        </Text>

                      </View>



                      <Text style={styles.bleSubText}>

                        Última conexão: agora há pouco

                      </Text>



                    </View>



                  </View>



                </View>



                {/* BOTÃO */}

                <TouchableOpacity

                  style={styles.editProfileButton}

                  onPress={() => setIsEditing(true)}

                >



                  <Ionicons

                    name="create-outline"

                    size={18}

                    color="#4DA6FF"

                    style={{ marginRight: 8 }}

                  />



                  <Text style={styles.editProfileButtonText}>

                    Editar Perfil

                  </Text>



                </TouchableOpacity>



              </>

            )}



            {/* EDIÇÃO */}

            {isEditing && (

              <>



                {/* NOME */}

                <View

                  style={[

                    styles.infoCard,

                    {  

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >

                  <Text style={styles.infoTitle}>

                    Nome

                  </Text>



                  <TextInput

                    style={styles.editInput}

                    value={name}

                    onChangeText={setName}

                  />

                </View>



                {/* CARGO */}

                <View

                  style={[

                    styles.infoCard,

                    {  

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >

                  <Text style={styles.infoTitle}>

                    Cargo

                  </Text>



                  <TextInput

                    style={styles.editInput}

                    value={position}

                    onChangeText={setPosition}

                  />

                </View>



                {/* STACKS */}

                <View

                  style={[

                    styles.infoCard,

                    {  

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >



                  <Text style={styles.infoTitle}>

                    Stacks

                  </Text>



                  <TouchableOpacity

                    style={styles.stackSelector}

                    onPress={() => setShowStacks(!showStacks)}

                  >



                    <Text style={styles.stackSelectorText}>

                      Selecionar stacks

                    </Text>



                    <Text style={styles.stackArrow}>

                      {showStacks ? "▲" : "▼"}

                    </Text>



                  </TouchableOpacity>



                  {/* STACKS SELECIONADAS */}

                  <View style={styles.selectedStacksContainer}>



                    {selectedStacks.map((stack) => (

                      <View

                        key={stack}

                        style={styles.selectedStackChip}

                      >



                        <Text style={styles.selectedStackText}>

                          {stack}

                        </Text>



                        <TouchableOpacity

                          onPress={() => toggleStack(stack)}

                        >

                          <Text style={styles.removeStack}>

                            ✕

                          </Text>

                        </TouchableOpacity>



                      </View>

                    ))}



                  </View>



                  {/* DROPDOWN */}

                  {showStacks && (

                    <>

                      {stackOptions.map((group) => (

                        <View

                          key={group.category}

                          style={styles.categoryBlock}

                        >



                          <Text style={styles.categoryTitle}>

                            {group.category}

                          </Text>



                          <View style={styles.categoryStacks}>



                            {group.items.map((stack) => (



                              <TouchableOpacity

                                key={stack}

                                style={[

                                  styles.stackOption,



                                  selectedStacks.includes(stack) &&

                                    styles.selectedStackOption,

                                ]}

                                onPress={() => toggleStack(stack)}

                              >



                                <Text style={styles.stackOptionText}>

                                  {stack}

                                </Text>



                              </TouchableOpacity>



                            ))}



                          </View>



                        </View>

                      ))}

                    </>

                  )}



                </View>



                {/* BIO */}

                <View

                  style={[

                    styles.infoCard,

                    {  

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >



                  <Text style={styles.infoTitle}>

                    Bio

                  </Text>



                  <TextInput

                    placeholder="Fale sobre você"

                    placeholderTextColor="#777"

                    style={styles.editTextArea}

                    multiline

                    value={bio}

                    onChangeText={setBio}

                  />



                </View>



                {/* OBJETIVO */}

                <View

                  style={[

                    styles.infoCard,

                    {  

                      padding: isMobile ? 16 : 24,

                      borderRadius: isMobile ? 20 : 28,

                    },

                  ]}

                >



                  <Text style={styles.infoTitle}>

                    Objetivo

                  </Text>



                  <TextInput

                    placeholder="Objetivo profissional"

                    placeholderTextColor="#777"

                    style={styles.editTextArea}

                    multiline

                    value={objective}

                    onChangeText={setObjective}

                  />



                </View>



                {/* BOTÕES */}

                <View style={styles.buttonRow}>



                  <TouchableOpacity

                    style={styles.cancelButton}

                    onPress={() => setIsEditing(false)}

                  >

                    <Text style={styles.cancelText}>

                      Cancelar

                    </Text>

                  </TouchableOpacity>



                  <TouchableOpacity

                    style={styles.saveButton}

                    onPress={handleSave}

                    disabled={loading}

                  >

                    {loading ? (

                      <ActivityIndicator color="#fff" />

                    ) : (

                      <Text style={styles.saveButtonText}>Salvar</Text>

                    )}

                  </TouchableOpacity>



                </View>



              </>

            )}



            <View style={{ height: 50 }} />



          </ScrollView>

        </SafeAreaView>

      </View>

    </ImageBackground>

  );

}



const styles = StyleSheet.create({



  background: {

    flex: 1,

  },



  backgroundImage: {

    resizeMode: "cover",

  },



  overlay: {

    flex: 1,

    backgroundColor: "rgba(2,6,23,0.92)",

  },



  container: {

    flex: 1,

    paddingTop: 34,

    paddingHorizontal: 20,

  },



  topBar: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 24,

  },



  backText: {

    color: "#4DA6FF",

    fontSize: 17,

  },



  avatarContainer: {

    alignItems: "center",

    marginBottom: 22,

  },



  avatar: {

    width: 110,

    height: 110,

    borderRadius: 55,

    borderWidth: 3,

    borderColor: "#4DA6FF",

  },



  cameraButton: {

    position: "absolute",

    bottom: 0,

    right: 0,

    backgroundColor: "#2979FF",

    width: 42,

    height: 42,

    borderRadius: 21,

    justifyContent: "center",

    alignItems: "center",

  },



  changePhotoText: {

    color: "#4DA6FF",

    marginTop: 12,

    fontSize: 16,

    fontWeight: "600",

  },



  profileName: {

    color: "#fff",

    fontSize: 22,

    fontWeight: "bold",

    marginTop: 18,

  },



  profilePosition: {

    color: "#4DA6FF",

    fontSize: 16,

    marginTop: 6,

  },



  stackContainer: {

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "center",

    marginBottom: 20,

  },



  techCard: {

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.05)",

    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 14,

    marginRight: 8,

    marginBottom: 8,

    borderWidth: 1,

    borderColor: "rgba(77,166,255,0.15)",

  },



  techIcon: {

    width: 16,

    height: 16,

    resizeMode: "contain",

    marginRight: 6,

  },



  techText: {

    color: "#fff",

    fontWeight: "600",

    fontSize: 12,

  },



  infoCard: {

    backgroundColor: "rgba(10,15,30,0.82)",

    borderRadius: 20,

    padding: 16,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.06)",

  },



  cardContent: {

    flexDirection: "row",

    alignItems: "flex-start",

  },



  textContent: {

    flex: 1,

    marginLeft: 12,

    paddingRight: 10,

  },



  iconCircle: {

    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "rgba(77,166,255,0.12)",

    justifyContent: "center",

    alignItems: "center",

  },



  infoTitle: {

    color: "#4DA6FF",

    fontWeight: "700",

    fontSize: 15,

    marginBottom: 6,

  },



  infoText: {

    color: "#D7E3FF",

    fontSize: 14,

    lineHeight: 20,

    flexShrink: 1,

  },



  bleRow: {

    flexDirection: "row",

    alignItems: "center",

  },



  greenDot: {

    width: 10,

    height: 10,

    borderRadius: 5,

    backgroundColor: "#00FF88",

    marginRight: 10,

  },



  bleText: {

    color: "#fff",

    fontSize: 15,

  },



  bleSubText: {

    color: "#7C8AA5",

    marginTop: 10,

    fontSize: 12,

  },



  editInput: {

    color: "#fff",

    fontSize: 15,

    backgroundColor: "rgba(255,255,255,0.04)",

    borderRadius: 14,

    paddingHorizontal: 14,

    paddingVertical: 14,

    marginTop: 10,

  },



  editTextArea: {

    color: "#fff",

    fontSize: 15,

    backgroundColor: "rgba(255,255,255,0.04)",

    borderRadius: 14,

    paddingHorizontal: 14,

    paddingVertical: 14,

    minHeight: 100,

    textAlignVertical: "top",

    marginTop: 10,

  },



  stackSelector: {

    backgroundColor: "rgba(255,255,255,0.05)",

    borderRadius: 14,

    paddingHorizontal: 14,

    paddingVertical: 14,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 10,

  },



  stackSelectorText: {

    color: "#fff",

    fontSize: 15,

  },



  stackArrow: {

    color: "#4DA6FF",

  },



  selectedStacksContainer: {

    flexDirection: "row",

    flexWrap: "wrap",

    marginTop: 14,

  },



  selectedStackChip: {

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "rgba(77,166,255,0.12)",

    borderRadius: 12,

    paddingHorizontal: 12,

    paddingVertical: 8,

    marginRight: 10,

    marginBottom: 10,

  },



  selectedStackText: {

    color: "#fff",

    fontSize: 13,

    marginRight: 8,

  },



  removeStack: {

    color: "#B8C7E0",

    fontSize: 14,

    fontWeight: "bold",

  },



  categoryBlock: {

    marginBottom: 18,

  },



  categoryTitle: {

    color: "#4DA6FF",

    fontSize: 15,

    fontWeight: "700",

    marginBottom: 12,

    marginTop: 10,

  },



  categoryStacks: {

    flexDirection: "row",

    flexWrap: "wrap",

  },



  stackOption: {

    backgroundColor: "rgba(255,255,255,0.05)",

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderRadius: 12,

    marginRight: 10,

    marginBottom: 10,

  },



  selectedStackOption: {

    backgroundColor: "rgba(77,166,255,0.18)",

    borderWidth: 1,

    borderColor: "rgba(77,166,255,0.35)",

  },



  stackOptionText: {

    color: "#fff",

    fontSize: 13,

  },



  editProfileButton: {

    height: 52,

    borderRadius: 18,

    borderWidth: 1.5,

    borderColor: "#2979FF",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 8,

    flexDirection: "row",

  },



  editProfileButtonText: {

    color: "#4DA6FF",

    fontSize: 18,

    fontWeight: "bold",

  },



  buttonRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 10,

  },



  cancelButton: {

    flex: 1,

    height: 52,

    borderRadius: 16,

    borderWidth: 1.5,

    borderColor: "#2979FF",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 8,

},



  saveButton: {

    flex: 1,

    height: 52,

    borderRadius: 16,

    backgroundColor: "#2979FF",

    justifyContent: "center",

    alignItems: "center",

    marginLeft: 8,

},



  cancelText: {

    color: "#4DA6FF",

    fontSize: 18,

    fontWeight: "bold",

  },



  saveButtonText: {

    color: "#fff",

    fontSize: 18,

    fontWeight: "bold",

  },

});