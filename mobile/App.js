import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:5000";
const EMAIL = "medico@cardioia.com";
const SENHA = "123456";

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [logado, setLogado] = useState(false);
  const [leitura, setLeitura] = useState(null);
  const [erroApi, setErroApi] = useState("");
  const [carregando, setCarregando] = useState(false);

  function entrar() {
    if (email.trim() === EMAIL && senha === SENHA) {
      setErroLogin("");
      setLogado(true);
      return;
    }
    setErroLogin("Credenciais inválidas");
  }

  async function consultar(sinais) {
    setCarregando(true);
    setErroApi("");
    try {
      const resposta = await fetch(`${API_URL}/api/risco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sinais),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setLeitura(null);
        setErroApi(dados.erro || "O backend recusou a leitura.");
        return;
      }
      setLeitura(dados);
    } catch (erro) {
      setLeitura(null);
      setErroApi(`Sem conexão com ${API_URL}. Suba o backend e tente de novo.`);
    } finally {
      setCarregando(false);
    }
  }

  if (!logado) {
    return (
      <SafeAreaView style={estilos.tela}>
        <Text style={estilos.titulo}>CardioIA</Text>
        <Text style={estilos.subtitulo}>Acesso do médico</Text>
        <TextInput
          style={estilos.campo}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={estilos.campo}
          secureTextEntry
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
        />
        {erroLogin ? <Text style={estilos.erro}>{erroLogin}</Text> : null}
        <Pressable style={estilos.botao} onPress={entrar}>
          <Text style={estilos.botaoTexto}>Entrar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView>
        <Text style={estilos.titulo}>Dados cardíacos</Text>
        <Text style={estilos.subtitulo}>Dr. Carlos Silva</Text>
        <Pressable
          style={estilos.botao}
          disabled={carregando}
          onPress={() => consultar({ temperatura: 36.5, fc_media: 78, umidade: 50 })}
        >
          <Text style={estilos.botaoTexto}>
            {carregando ? "Consultando..." : "Leitura estável"}
          </Text>
        </Pressable>
        <Pressable
          style={[estilos.botao, estilos.botaoAlerta]}
          disabled={carregando}
          onPress={() => consultar({ temperatura: 38.6, fc_media: 132, umidade: 55 })}
        >
          <Text style={estilos.botaoTexto}>Sinais acima do limite</Text>
        </Pressable>
        {erroApi ? <Text style={estilos.erro}>{erroApi}</Text> : null}
        {leitura ? (
          <View style={estilos.cartao}>
            <Text style={estilos.classe}>{leitura.classificacao}</Text>
            <Text style={estilos.risco}>
              Probabilidade de pico: {Math.round(leitura.risco_previsto * 100)}%
            </Text>
            <Text style={estilos.rotulo}>Protocolos</Text>
            {leitura.protocolos.length === 0 ? (
              <Text style={estilos.item}>Nenhum protocolo acionado.</Text>
            ) : (
              leitura.protocolos.map((item) => (
                <Text key={item} style={estilos.item}>
                  • {item}
                </Text>
              ))
            )}
          </View>
        ) : null}
        <Pressable onPress={() => setLogado(false)}>
          <Text style={estilos.sair}>Sair</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#f4f6fb", padding: 24 },
  titulo: { fontSize: 28, fontWeight: "700", color: "#2c3e50", marginTop: 24 },
  subtitulo: { color: "#667eea", marginBottom: 24, marginTop: 4 },
  campo: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d9dde7",
  },
  botao: {
    backgroundColor: "#667eea",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  botaoAlerta: { backgroundColor: "#e74c3c" },
  botaoTexto: { color: "#fff", fontWeight: "700" },
  erro: { color: "#e74c3c", marginTop: 12 },
  cartao: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  classe: { fontSize: 20, fontWeight: "700", color: "#2c3e50" },
  risco: { marginTop: 6, marginBottom: 12, color: "#2c3e50" },
  rotulo: { fontWeight: "700", marginBottom: 6, color: "#2c3e50" },
  item: { color: "#2c3e50", marginBottom: 4 },
  sair: { color: "#667eea", textAlign: "center", marginVertical: 24 },
});
