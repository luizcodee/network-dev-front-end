import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  Animated,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import * as ImagePicker from "expo-image-picker";

import {
  getPosts,
  createPost,
  createPostWithImage,
  toggleLike,
} from "../services/postService";

import { getStoredUserId } from "../services/auth";

import { useResponsive } from "../utils/responsive";

const MOCK_PHOTOS = [
  {
    id: "7",
    user: "luiz",
    role: "Java",
    avatar: "https://i.pravatar.cc/150?img=32",
    url: "https://picsum.photos/id/1/800/800",
    description: "Head de Tecnologia Senior",
    likes: 24,
    liked: false,
  },

  {
    id: "8",
    user: "Joice",
    role: "Java",
    avatar: "https://i.pravatar.cc/150?img=12",
    url: "https://picsum.photos/id/20/800/800",
    description: "PO de Tecnologia Senior",
    likes: 17,
    liked: false,
  },

  {
    id: "9",
    user: "Adriel",
    role: "Java",
    avatar: "https://firebasestorage.googleapis.com/v0/b/dev-net-24be1.firebasestorage.app/o/posts%2Fa4799aa6-fe1b-4afd-9e27-30ffd2d14e82-IMG_3529.HEIC?alt=media",
    url: "https://picsum.photos/id/30/800/800",
    description: "Front end de Tecnologia",
    likes: 42,
    liked: false,
  },
];

export default function FeedScreen({ navigation }: any) {
  const { width } = useWindowDimensions();

  const {
    isMobile,
    isTablet,
    isDesktop,
  } = useResponsive();

  const [posts, setPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [createPostVisible, setCreatePostVisible] = useState(false);

  const [postText, setPostText] = useState("");

  const [newImage, setNewImage] = useState<string | null>(null);

  const likeAnimations = useRef<{
    [key: string]: Animated.Value;
  }>({}).current;

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const normalizePost = (p: any) => {
    console.log("Normalizando post recebido:", p);
    const id = p?.id != null ? String(p.id) : p?._id != null ? String(p._id) : String(Math.random());
    // O Spring Boot salva e retorna como imageUrl. Garantimos o fallback caso venha vazio.
    const rawUrl = p?.imageUrl ?? p?.url ?? null;
    const url = rawUrl ? String(rawUrl) : null;

    return {
      ...p,
      id,
      url, // O componente <Image> usará essa propriedade resolvida
      likes: p?.likes ?? 0,
      liked: p?.liked ?? false,
      user: p?.user ?? `Usuário ${p?.userId ?? ""}`,
      avatar: p?.avatar ?? "https://i.pravatar.cc/150?img=32",
    };
  };

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    setLoading(true);
    try {
      const storedId = await getStoredUserId();
      setUserId(storedId ? Number(storedId) : null);

      const response = await getPosts(0, 10);
      const items = response?.content || [];
      const normalized = items.map(normalizePost);

      normalized.forEach((item: any) => {
        likeAnimations[item.id] = new Animated.Value(1);
      });

      setPosts(normalized);
      setPage(0);
      setHasMore(normalized.length === 10 && (response.totalPages == null || response.totalPages > 1));
    } catch (error) {
      console.log("Erro ao carregar feed", error);
      // Use real API only — don't fall back to mocks in production.
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await getPosts(nextPage, 10);
      const items = response?.content || [];
      const normalized = items.map(normalizePost);

      normalized.forEach((item: any) => {
        likeAnimations[item.id] = new Animated.Value(1);
      });

      setPosts((prev) => [...prev, ...normalized]);
      setPage(nextPage);
      setHasMore(normalized.length === 10 && (response.totalPages == null || response.totalPages > nextPage));
    } catch (error) {
      console.log("Erro ao carregar mais posts", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Define o tamanho da imagem para ser 1/3 da tela (grid)
  // No PC, limitamos a largura máxima para não distorcer

  const numColumns = isDesktop
    ? 3
    : isTablet
    ? 2
    : 1;

  const imageSize = isDesktop
    ? 360
    : isTablet
    ? width * 0.42
    : width - 32;

  const handleAddPhoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão necessária",
        "Você precisa permitir o acesso à galeria."
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,

        allowsEditing: true,

        quality: 0.7,
      });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!postText && !newImage) {
      Alert.alert(
        "Erro",
        "Adicione um texto ou imagem."
      );

      return;
    }

    setLoading(true);
    try {
      const storedId = await getStoredUserId();
      if (!storedId) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      const userNumber = Number(storedId);

      const createdPost = newImage
        ? await createPostWithImage(userNumber, postText, newImage)
        : await createPost(userNumber, postText);

      const preparedPost = normalizePost({
        ...createdPost,
        role: "Desenvolvedor",
      });

      // provide sane defaults
      preparedPost.role = preparedPost.role ?? "Desenvolvedor";
      preparedPost.likes = preparedPost.likes ?? 0;
      preparedPost.liked = preparedPost.liked ?? false;

      likeAnimations[preparedPost.id] = new Animated.Value(1);
      setPosts((prev) => [preparedPost, ...prev]);
      setPostText("");
      setNewImage(null);
      setCreatePostVisible(false);
    } catch (error) {
      console.log("Erro ao criar post", error);
      Alert.alert("Erro", "Não foi possível publicar.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string | number) => {
    const key = String(id);

    Animated.sequence([
      Animated.timing(likeAnimations[key], {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimations[key], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setPosts((prev) =>
      prev.map((post) =>
        post.id === key
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    if (!userId) return;

    try {
      await toggleLike(Number(key), userId);
    } catch (error) {
      console.log("Erro ao persistir like", error);
    }
  };

  const handleInfiniteScroll = () => {
    loadMorePosts();
  };

  const handleDelete = async () => {
    Alert.alert(
      "Apagar Foto",
      "Deseja realmente remover esta foto?",
      [
        {
          text: "Cancelar",

          style: "cancel",
        },

        {
          text: "Apagar",

          style: "destructive",

          onPress: () => {
            setPosts((prev) =>
              prev.filter(
                (p) => p.id !== selectedPostId
              )
            );

            setSelectedImage(null);
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={["#020B1D", "#07152B"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}

        <View
          style={[
            styles.header,
            {
              paddingHorizontal: isMobile
                ? 18
                : 28,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#4DA6FF"
            />
          </TouchableOpacity>

          <Image
            source={require("../assets/logo.png")}
            style={{
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              resizeMode: "contain",
            }}
          />

          <TouchableOpacity
            style={styles.postButton}
            onPress={() =>
              setCreatePostVisible(true)
            }
          >
            <Ionicons
              name="add-circle"
              size={34}
              color="#3B82F6"
            />
          </TouchableOpacity>
        </View>

        {/* FEED */}

        {posts.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={styles.skeletonCard}
              >
                <View
                  style={styles.skeletonAvatar}
                />

                <View
                  style={styles.skeletonImage}
                />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id?.toString() || String(item.id)}
            numColumns={numColumns}
            key={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: isMobile ? 16 : 22,
              paddingBottom: 120,
            }}
            columnWrapperStyle={
              !isMobile
                ? {
                    justifyContent:
                      "space-between",

                    marginBottom: 22,
                  }
                : undefined
            }
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="large"
                  color="#3B82F6"
                  style={{
                    marginVertical: 20,
                  }}
                />
              ) : null
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.postCard,
                  {
                    width: imageSize,
                  },
                ]}
              >
                {/* USER */}

                <View style={styles.postHeader}>
                  <View
                    style={styles.userInfo}
                  >
                    <Image
                      source={{
                        uri: item.avatar,
                      }}
                      style={styles.avatar}
                    />

                    <View>
                      <Text
                        style={
                          styles.userName
                        }
                      >
                        {item.user}
                      </Text>

                      <Text
                        style={
                          styles.userRole
                        }
                      >
                        {item.role}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color="#fff"
                  />
                </View>

                {/* DESCRIPTION */}

                <Text
                  style={styles.description}
                >
                  {item.description}
                </Text>

                {/* IMAGE */}

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedImage(
                      item.url
                    );

                    setSelectedPostId(
                      item.id
                    );
                  }}
                >
                  <Image
                    source={{
                      uri: item.url,
                    }}
                    style={[
                      styles.postImage,
                      {
                        height: isMobile
                          ? 300
                          : 360,
                      },
                    ]}
                  />
                </TouchableOpacity>

                {/* ACTIONS */}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={
                      styles.actionButton
                    }
                    onPress={() =>
                      handleLike(item.id)
                    }
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            scale:
                              likeAnimations[
                                item.id
                              ] ||
                              new Animated.Value(
                                1
                              ),
                          },
                        ],
                      }}
                    >
                      <Ionicons
                        name={
                          item.liked
                            ? "heart"
                            : "heart-outline"
                        }
                        size={24}
                        color={
                          item.liked
                            ? "#ff4d6d"
                            : "#fff"
                        }
                      />
                    </Animated.View>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      {item.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.actionButton
                    }
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={22}
                      color="#fff"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.actionButton
                    }
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={22}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* MODAL CREATE POST */}

        <Modal
          visible={createPostVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.createPostModal,
                {
                  width: isMobile
                    ? "100%"
                    : 600,
                },
              ]}
            >
              <Text style={styles.modalTitle}>
                Criar publicação
              </Text>

              <TextInput
                placeholder="Compartilhe algo..."
                placeholderTextColor="#8A94A6"
                multiline
                value={postText}
                onChangeText={setPostText}
                style={styles.input}
              />

              {newImage && (
                <Image
                  source={{ uri: newImage }}
                  style={
                    styles.previewImage
                  }
                />
              )}

              <View
                style={styles.modalActions}
              >
                <TouchableOpacity
                  style={
                    styles.secondaryButton
                  }
                  onPress={handleAddPhoto}
                >
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.secondaryText
                    }
                  >
                    Imagem
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.publishButton
                  }
                  onPress={
                    handleCreatePost
                  }
                >
                  <Text
                    style={
                      styles.publishText
                    }
                  >
                    Publicar
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setCreatePostVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL FULLSCREEN */}

        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
        >
          <View
            style={styles.modalBackground}
          >
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() =>
                setSelectedImage(null)
              }
            >
              <Ionicons
                name="close"
                size={35}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={28}
                color="#ff4d4d"
              />
            </TouchableOpacity>

            {selectedImage && (
              <Image
                source={{
                  uri: selectedImage,
                }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,

    alignSelf: "center",

    width: "100%",

    maxWidth: 1400,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  postButton: {
    padding: 5,
  },

  postCard: {
    backgroundColor:
      "rgba(255,255,255,0.04)",

    borderRadius: 22,

    overflow: "hidden",

    marginBottom: 20,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.06)",
  },

  postHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    padding: 14,
  },

  userInfo: {
    flexDirection: "row",

    alignItems: "center",
  },

  avatar: {
    width: 46,

    height: 46,

    borderRadius: 999,

    marginRight: 12,
  },

  userName: {
    color: "#fff",

    fontSize: 15,

    fontWeight: "700",
  },

  userRole: {
    color: "#8A94A6",

    fontSize: 13,

    marginTop: 2,
  },

  description: {
    color: "#fff",

    fontSize: 15,

    lineHeight: 22,

    paddingHorizontal: 14,

    marginBottom: 12,
  },

  postImage: {
    width: "100%",
  },

  actions: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    paddingVertical: 14,

    gap: 20,
  },

  actionButton: {
    flexDirection: "row",

    alignItems: "center",
  },

  actionText: {
    color: "#fff",

    marginLeft: 6,

    fontWeight: "600",
  },

  modalBackground: {
    flex: 1,

    backgroundColor: "black",

    justifyContent: "center",

    alignItems: "center",
  },

  fullImage: {
    width: "100%",

    height: "80%",
  },

  closeModal: {
    position: "absolute",

    top: 50,

    right: 20,

    zIndex: 10,

    padding: 10,

    backgroundColor:
      "rgba(0,0,0,0.5)",

    borderRadius: 25,
  },

  deleteButton: {
    position: "absolute",

    bottom: 50,

    zIndex: 10,

    padding: 15,

    backgroundColor:
      "rgba(255,255,255,0.1)",

    borderRadius: 30,
  },

  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.6)",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },

  createPostModal: {
    backgroundColor: "#081228",

    borderRadius: 26,

    padding: 22,
  },

  modalTitle: {
    color: "#fff",

    fontSize: 22,

    fontWeight: "800",

    marginBottom: 20,
  },

  input: {
    backgroundColor:
      "rgba(255,255,255,0.05)",

    borderRadius: 18,

    padding: 18,

    color: "#fff",

    minHeight: 140,

    textAlignVertical: "top",

    fontSize: 16,
  },

  previewImage: {
    width: "100%",

    height: 220,

    borderRadius: 18,

    marginTop: 18,
  },

  modalActions: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 20,
  },

  secondaryButton: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      "rgba(255,255,255,0.08)",

    paddingHorizontal: 18,

    paddingVertical: 14,

    borderRadius: 16,
  },

  secondaryText: {
    color: "#fff",

    fontWeight: "700",

    marginLeft: 8,
  },

  publishButton: {
    backgroundColor: "#2563EB",

    paddingHorizontal: 26,

    paddingVertical: 14,

    borderRadius: 16,
  },

  publishText: {
    color: "#fff",

    fontWeight: "800",

    fontSize: 15,
  },

  closeButton: {
    position: "absolute",

    top: 18,

    right: 18,
  },

  skeletonContainer: {
    padding: 16,
  },

  skeletonCard: {
    backgroundColor:
      "rgba(255,255,255,0.04)",

    borderRadius: 22,

    marginBottom: 18,

    overflow: "hidden",
  },

  skeletonAvatar: {
    width: 46,

    height: 46,

    borderRadius: 999,

    backgroundColor:
      "rgba(255,255,255,0.08)",

    margin: 16,
  },

  skeletonImage: {
    width: "100%",

    height: 300,

    backgroundColor:
      "rgba(255,255,255,0.06)",
  },
});