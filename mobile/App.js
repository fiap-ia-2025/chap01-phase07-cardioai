import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://chap01-phase07-cardioai.onrender.com";
const EMAIL = "medico@cardioia.com";
const SENHA = "123456";

function horario(iso) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return iso;
  }
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [logado, setLogado] = useState(false);
  const [leituras, setLeituras] = useState([]);
  const [aberta, setAberta] = useState(null);
  const [erroApi, setErroApi] = useState("");
  const [atualizando, setAtualizando] = useState(false);

  function entrar() {
    if (email.trim() === EMAIL && senha === SENHA) {
      setErroLogin("");
      setLogado(true);
      return;
    }
    setErroLogin("Credenciais inválidas");
  }

  async function carregarLeituras() {
    setAtualizando(true);
    setErroApi("");
    try {
      const resposta = await fetch(`${API_URL}/api/historico`);
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErroApi(dados.erro || "Não foi possível buscar as leituras.");
        return;
      }
      setLeituras(dados.leituras || []);
    } catch {
      setErroApi("Não foi possível buscar as leituras. Tente atualizar de novo.");
    } finally {
      setAtualizando(false);
    }
  }

  useEffect(() => {
    if (logado) {
      carregarLeituras();
    }
  }, [logado]);

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

  const recentes = [...leituras].reverse();
  const altoRisco = leituras.filter((item) => item.classificacao === "ALTO RISCO").length;
  const comProtocolo = leituras.filter((item) => item.protocolos.length > 0).length;

  return (
    <SafeAreaView style={estilos.tela}>
      <ScrollView>
        <Text style={estilos.titulo}>Leituras</Text>
        <Text style={estilos.texto}>
          O sensor envia temperatura e batimento. Toque numa linha para ver a chance de pico e os protocolos.
        </Text>
        <Pressable style={estilos.botao} disabled={atualizando} onPress={carregarLeituras}>
          <Text style={estilos.botaoTexto}>{atualizando ? "Atualizando..." : "Atualizar"}</Text>
        </Pressable>
        <Text style={estilos.dica}>
          Use Atualizar depois que o sensor conectar, para trazer as leituras novas.
        </Text>
        {erroApi ? <Text style={estilos.erro}>{erroApi}</Text> : null}
        <Text style={estilos.contadores}>
          {leituras.length} leituras · Alto risco: {altoRisco} · Com protocolo: {comProtocolo}
        </Text>
        {recentes.length === 0 ? (
          <Text style={estilos.vazio}>
            Nenhuma leitura ainda. Rode o sensor e, quando o link conectar, toque em Atualizar.
          </Text>
        ) : (
          recentes.map((item, indice) => {
            const chave = `${item.registrado_em}-${indice}`;
            const abertaEsta = aberta === chave;
            return (
              <View key={chave}>
                <Pressable style={estilos.linha} onPress={() => setAberta(abertaEsta ? null : chave)}>
                  <Text style={item.classificacao === "ALTO RISCO" ? estilos.alto : estilos.baixo}>
                    {item.classificacao}
                  </Text>
                  <Text style={estilos.item}>
                    {horario(item.registrado_em)} · {item.valores.temperatura} °C · {item.valores.fc_media} bpm
                  </Text>
                </Pressable>
                {abertaEsta ? (
                  <View style={estilos.cartao}>
                    <Text style={estilos.item}>Horário: {horario(item.registrado_em)}</Text>
                    <Text style={estilos.item}>Temperatura: {item.valores.temperatura} °C</Text>
                    <Text style={estilos.item}>Batimento: {item.valores.fc_media} bpm</Text>
                    <Text style={estilos.item}>
                      Probabilidade de pico: {Math.round(item.risco_previsto * 100)}%
                    </Text>
                    <Text style={estilos.item}>Classe: {item.classificacao}</Text>
                    <Text style={estilos.rotulo}>Protocolos</Text>
                    {item.protocolos.length === 0 ? (
                      <Text style={estilos.item}>Nenhum protocolo acionado.</Text>
                    ) : (
                      item.protocolos.map((protocolo) => (
                        <Text key={protocolo} style={estilos.item}>
                          • {protocolo}
                        </Text>
                      ))
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
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
  texto: { color: "#5d6d7e", marginTop: 8, marginBottom: 16 },
  dica: { color: "#5d6d7e", marginTop: 8 },
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
  botaoTexto: { color: "#fff", fontWeight: "700" },
  erro: { color: "#e74c3c", marginTop: 12 },
  contadores: { color: "#2c3e50", fontWeight: "700", marginTop: 16, marginBottom: 8 },
  vazio: { color: "#5d6d7e", marginTop: 12 },
  linha: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
  },
  baixo: { color: "#1e8449", fontWeight: "700" },
  alto: { color: "#e74c3c", fontWeight: "700" },
  cartao: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  rotulo: { fontWeight: "700", marginTop: 8, marginBottom: 6, color: "#2c3e50" },
  item: { color: "#2c3e50", marginBottom: 4 },
  sair: { color: "#667eea", textAlign: "center", marginVertical: 24 },
});
