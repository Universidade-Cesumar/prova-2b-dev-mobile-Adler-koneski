import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, FlatList, ActivityIndicator,
  Alert, RefreshControl, Platform, Keyboard, TouchableWithoutFeedback, Pressable
} from 'react-native';
import { validarRetirada } from './src/utils/validacoes';

const API_MATERIAIS = 'https://6a2b34d9b687a7d5cbc4f27f.mockapi.io/materiais';
const API_USUARIOS = 'https://6a2b34d9b687a7d5cbc4f27f.mockapi.io/usuarios';

// Alert compatível com web e mobile
const alertar = (titulo, mensagem, botoes) => {
  if (Platform.OS === 'web') {
    if (botoes && botoes.length > 1) {
      const confirmou = window.confirm(`${titulo}\n\n${mensagem}`);
      if (confirmou && botoes[1] && botoes[1].onPress) {
        botoes[1].onPress();
      }
    } else {
      window.alert(`${titulo}\n\n${mensagem}`);
    }
  } else {
    Alert.alert(titulo, mensagem, botoes);
  }
};

const getSaudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
};

const getDataFormatada = () => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
};

export default function App() {
  // Autenticação
  const [usuario, setUsuario] = useState(null);
  const [telaAuth, setTelaAuth] = useState('login');
  const [authNome, setAuthNome] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Materiais
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisivel, setFormVisivel] = useState(false);
  const [busca, setBusca] = useState('');
  const [retiradas, setRetiradas] = useState({});

  // ===== AUTENTICAÇÃO =====
  const fazerLogin = async () => {
    if (!authEmail.trim() || !authSenha.trim()) {
      alertar('Atenção', 'Preencha email e senha.');
      return;
    }
    setAuthLoading(true);
    try {
      const response = await fetch(API_USUARIOS);
      const data = await response.json();
      const encontrado = data.find(
        u => u.email === authEmail.trim() && u.senha === authSenha.trim()
      );
      if (encontrado) {
        setUsuario(encontrado);
        setAuthEmail('');
        setAuthSenha('');
      } else {
        alertar('Erro', 'Email ou senha inválidos.');
      }
    } catch (error) {
      alertar('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fazerCadastro = async () => {
    if (!authNome.trim() || !authEmail.trim() || !authSenha.trim()) {
      alertar('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (authSenha.length < 4) {
      alertar('Atenção', 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    setAuthLoading(true);
    try {
      const check = await fetch(API_USUARIOS);
      const usuarios = await check.json();
      if (usuarios.find(u => u.email === authEmail.trim())) {
        alertar('Erro', 'Este email já está cadastrado.');
        setAuthLoading(false);
        return;
      }
      const response = await fetch(API_USUARIOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: authNome.trim(),
          email: authEmail.trim(),
          senha: authSenha.trim(),
        }),
      });
      const novo = await response.json();
      setUsuario(novo);
      setAuthNome('');
      setAuthEmail('');
      setAuthSenha('');
      alertar('Sucesso', 'Cadastro realizado com sucesso!');
    } catch (error) {
      alertar('Erro', 'Não foi possível realizar o cadastro.');
    } finally {
      setAuthLoading(false);
    }
  };

  const fazerLogout = () => {
    setUsuario(null);
    setTelaAuth('login');
  };

  // ===== MATERIAIS =====
  // Sprint 2 - Regras de Negócio:
  // - Baixa de estoque (PUT) com validação via validarRetirada
  // - Exclusão de material (DELETE) com confirmação
  // - Entrada de estoque (PUT) para reposição
  // - Bloqueio de retirada em estoque zerado
  // - Bloqueio de exclusão com estoque acima de zero
 const buscarMateriais = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_MATERIAIS);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        alertar('Sem conexão', 'Verifique sua conexão com a internet e tente novamente.');
      } else {
        alertar('Erro', 'Não foi possível carregar o estoque. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(API_MATERIAIS);
      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const cadastrarMaterial = async () => {
    if (!nome.trim() || !quantidade.trim()) {
      alertar('Atenção', 'Preencha o nome e a quantidade.');
      return;
    }
    if (isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      alertar('Atenção', 'A quantidade deve ser um número maior que zero.');
      return;
    }

    setCadastrando(true);
    try {
      const response = await fetch(API_MATERIAIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), quantidade: Number(quantidade) }),
      });
      const novo = await response.json();
      setMateriais((prev) => [...prev, novo]);
      setNome('');
      setQuantidade('');
      setFormVisivel(false);
      alertar('Sucesso', `${novo.nome} cadastrado com ${novo.quantidade} unidades.`);
    } catch (error) {
      alertar('Erro', 'Não foi possível cadastrar o material.');
    } finally {
      setCadastrando(false);
    }
  };

  // DELETE - Excluir material
  const excluirMaterial = async (id, nomeMaterial) => {
    const material = materiais.find(m => m.id === id);
    if (material && Number(material.quantidade) > 0) {
      alertar(
        'Ação bloqueada',
        `"${nomeMaterial}" ainda possui ${material.quantidade} unidades em estoque. Zere o estoque antes de excluir.`
      );
      return;
    }

    alertar(
      'Confirmar exclusão',
      `Deseja excluir "${nomeMaterial}" do estoque?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_MATERIAIS}/${id}`, { method: 'DELETE' });
              setMateriais((prev) => prev.filter((item) => item.id !== id));
              alertar('Sucesso', `"${nomeMaterial}" foi removido do estoque.`);
            } catch (error) {
              alertar('Erro', 'Não foi possível excluir o material.');
            }
          },
        },
      ]
    );
  };

  // PUT - Baixa de estoque
  const baixarEstoque = async (item) => {
    const qtdRetirada = Number(retiradas[item.id] || 0);
    const estoqueAtual = Number(item.quantidade);

    if (!validarRetirada(estoqueAtual, qtdRetirada)) {
      alertar('Operação inválida', 'Quantidade inválida ou superior ao estoque disponível.');
      return;
    }

    alertar(
      'Confirmar retirada',
      `Retirar ${qtdRetirada} unidades de "${item.nome}"?\nSaldo atual: ${estoqueAtual} → Novo saldo: ${estoqueAtual - qtdRetirada}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const novaQtd = estoqueAtual - qtdRetirada;
              const response = await fetch(`${API_MATERIAIS}/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: novaQtd }),
              });
              const atualizado = await response.json();
              setMateriais((prev) =>
                prev.map((m) => (m.id === item.id ? atualizado : m))
              );
              setRetiradas((prev) => ({ ...prev, [item.id]: '' }));
              Keyboard.dismiss();
              alertar('Sucesso', `Retiradas ${qtdRetirada} unidades de "${item.nome}". Novo saldo: ${novaQtd}`);
            } catch (error) {
              alertar('Erro', 'Não foi possível realizar a baixa.');
            }
          },
        },
      ]
    );
  };

  // PUT - Entrada de estoque
  const entradaEstoque = async (item) => {
    const qtdEntrada = Number(retiradas[item.id] || 0);

    if (isNaN(qtdEntrada) || qtdEntrada <= 0) {
      alertar('Atenção', 'Informe uma quantidade válida para entrada.');
      return;
    }

    try {
      const novaQtd = Number(item.quantidade) + qtdEntrada;
      const response = await fetch(`${API_MATERIAIS}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: novaQtd }),
      });
      const atualizado = await response.json();
      setMateriais((prev) =>
        prev.map((m) => (m.id === item.id ? atualizado : m))
      );
      setRetiradas((prev) => ({ ...prev, [item.id]: '' }));
      Keyboard.dismiss();
      alertar('Sucesso', `Adicionadas ${qtdEntrada} unidades a "${item.nome}". Novo saldo: ${novaQtd}`);
    } catch (error) {
      alertar('Erro', 'Não foi possível realizar a entrada.');
    }
  };

  useEffect(() => {
    if (usuario) {
      buscarMateriais();
    }
  }, [usuario]);

  const totalUnidades = materiais.reduce(
    (acc, item) => acc + Number(item.quantidade || 0), 0
  );

  const totalAlertas = materiais.filter(i => Number(i.quantidade) <= 20).length;

  const materiaisFiltrados = materiais
    .filter(item => item.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // ===== TELA DE LOGIN/CADASTRO =====
  if (!usuario) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authBrand}>SISTEMA DE ALMOXARIFADO</Text>
          <Text style={styles.authTitle}>
            {telaAuth === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
          </Text>
          <Text style={styles.authSubtitle}>
            {telaAuth === 'login'
              ? 'Entre com suas credenciais para continuar'
              : 'Preencha os dados para se cadastrar'}
          </Text>

          {telaAuth === 'cadastro' && (
            <>
              <Text style={styles.inputLabel}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Camila Silva"
                placeholderTextColor="#9aa5b1"
                value={authNome}
                onChangeText={setAuthNome}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#9aa5b1"
            value={authEmail}
            onChangeText={setAuthEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9aa5b1"
            value={authSenha}
            onChangeText={setAuthSenha}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [styles.button, authLoading && styles.buttonDisabled, pressed && { opacity: 0.8 }]}
            onPress={telaAuth === 'login' ? fazerLogin : fazerCadastro}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {telaAuth === 'login' ? 'ENTRAR' : 'CADASTRAR'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setTelaAuth(telaAuth === 'login' ? 'cadastro' : 'login')}
            style={styles.authSwitch}
          >
            <Text style={styles.authSwitchText}>
              {telaAuth === 'login'
                ? 'Não tem conta? Cadastre-se'
                : 'Já tem conta? Faça login'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ===== TELA PRINCIPAL =====
  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerBrand}>SISTEMA DE ALMOXARIFADO</Text>
            <Text style={styles.headerTitle}>Controle de Insumos</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={fazerLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSubtitle}>{getSaudacao()}, {usuario.nome}</Text>
          <Text style={styles.headerDate}>{getDataFormatada()}</Text>
        </View>
      </View>

      {/* Indicadores */}
      <View style={styles.indicadoresContainer}>
        <Text style={styles.sectionLabel}>INDICADORES</Text>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tipos de material</Text>
            <Text style={styles.cardNumber}>{materiais.length}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total de unidades</Text>
            <Text style={[styles.cardNumber, styles.cardNumberPrimary]}>{totalUnidades}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Estoque baixo</Text>
            <Text style={[styles.cardNumber, totalAlertas > 0 && styles.cardNumberAlerta]}>
              {totalAlertas}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Itens zerados</Text>
            <Text style={[styles.cardNumber, materiais.filter(i => Number(i.quantidade) === 0).length > 0 && styles.cardNumberAlerta]}>
              {materiais.filter(i => Number(i.quantidade) === 0).length}
            </Text>
          </View>
        </View>
      </View>

      {!formVisivel && (
        <Pressable
          style={({ pressed }) => [styles.novoButton, pressed && { opacity: 0.8 }]}
          onPress={() => setFormVisivel(true)}
        >
          <Text style={styles.novoButtonText}>+ NOVO MATERIAL</Text>
        </Pressable>
      )}

      {formVisivel && (
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Cadastrar Material</Text>
            <Pressable onPress={() => setFormVisivel(false)}>
              <Text style={styles.formClose}>Fechar</Text>
            </Pressable>
          </View>
          <Text style={styles.inputLabel}>Nome do material</Text>
          <TextInput
            testID="input-nome"
            style={styles.input}
            placeholder="Ex: Luva cirúrgica"
            placeholderTextColor="#9aa5b1"
            value={nome}
            onChangeText={setNome}
          />
          <Text style={styles.inputLabel}>Quantidade</Text>
          <TextInput
            testID="input-quantidade"
            style={styles.input}
            placeholder="Ex: 100"
            placeholderTextColor="#9aa5b1"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
          <Pressable
            testID="btn-cadastrar"
            style={({ pressed }) => [styles.button, cadastrando && styles.buttonDisabled, pressed && { opacity: 0.8 }]}
            onPress={cadastrarMaterial}
            disabled={cadastrando}
          >
            {cadastrando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>CADASTRAR</Text>
            )}
          </Pressable>
        </View>
      )}

    <View style={styles.listHeader}>
        <Text style={styles.sectionLabel}>INVENTÁRIO</Text>
        <Text testID="total-itens" style={styles.totalItens}>{materiaisFiltrados.length} itens</Text>
        <Pressable onPress={buscarMateriais}>
          <Text style={styles.refreshLink}>Atualizar</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          testID="input-busca"
          style={styles.searchInput}
          placeholder="Buscar material..."
          placeholderTextColor="#9aa5b1"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <Pressable onPress={() => setBusca('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>limpar</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1e3a5f" />
          <Text style={styles.loadingText}>Carregando inventário</Text>
        </View>
      ) : (
        <FlatList
          testID="lista-materiais"
          data={materiaisFiltrados}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1e3a5f']} />
          }
         renderItem={({ item }) => {
              const qtd = Number(item.quantidade);
              const estoqueCritico = qtd < 10;
              const estoqueBaixo = qtd <= 20;
              const zerado = qtd === 0;
              return (
                <View
                  style={[styles.item, zerado && styles.itemZerado, estoqueCritico && styles.itemCritico]}
                  accessibilityLabel={estoqueCritico ? 'estoque-critico' : undefined}
                >
                  {estoqueBaixo && <View style={styles.itemAccent} />}
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemContent}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemNome}>{item.nome}</Text>
                        <Text style={[styles.itemLabel, estoqueBaixo && styles.itemLabelAlerta]}>
                          {estoqueCritico ? 'Estoque crítico' : estoqueBaixo ? 'Estoque baixo' : 'Disponível'}
                        </Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={[styles.itemQtd, estoqueBaixo && styles.itemQtdAlerta]}>
                          {item.quantidade}
                        </Text>
                        <Text style={styles.itemQtdLabel}>unidades</Text>
                      </View>
                    </View>
                    <View style={styles.itemActions}>
                      <TextInput
                        testID="input-retirada"
                        style={styles.inputRetirada}
                        placeholder="Qtd"
                        placeholderTextColor="#9aa5b1"
                        value={retiradas[item.id] || ''}
                        onChangeText={(text) =>
                          setRetiradas((prev) => ({ ...prev, [item.id]: text }))
                        }
                        keyboardType="numeric"
                      />
                      <Pressable
                        testID="btn-baixar"
                        style={({ pressed }) => [styles.baixarButton, zerado && styles.buttonDisabled, pressed && { opacity: 0.7 }]}
                        onPress={() => baixarEstoque(item)}
                        disabled={zerado}
                      >
                        <Text style={styles.baixarButtonText}>Retirar</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.entradaButton, pressed && { opacity: 0.7 }]}
                        onPress={() => entradaEstoque(item)}
                      >
                        <Text style={styles.entradaButtonText}>Entrada</Text>
                      </Pressable>
                      <Pressable
                        testID="btn-excluir"
                        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
                        onPress={() => excluirMaterial(item.id, item.nome)}
                      >
                        <Text style={styles.deleteButtonText}>Excluir</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {busca.length > 0 ? 'Nenhum resultado encontrado' : 'Inventário vazio'}
              </Text>
              <Text style={styles.emptySubText}>
                {busca.length > 0 ? `Sem correspondência para "${busca}"` : 'Cadastre o primeiro material para iniciar'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 420,
  },
  authBrand: {
    fontSize: 10,
    color: '#7fa3c9',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  authSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  authSwitch: {
    marginTop: 16,
    alignItems: 'center',
  },
  authSwitchText: {
    fontSize: 13,
    color: '#1e3a5f',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    backgroundColor: '#1e3a5f',
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerBrand: {
    fontSize: 10,
    color: '#7fa3c9',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  headerInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 12,
    color: '#a8c0d6',
    textTransform: 'capitalize',
  },
  indicadoresContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  cardNumberPrimary: { color: '#1e3a5f' },
  cardNumberAlerta: { color: '#c2410c' },
  novoButton: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#1e3a5f',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  novoButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  form: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  formClose: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  button: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    marginBottom: 12,
  },
  refreshLink: {
    fontSize: 12,
    color: '#1e3a5f',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1e293b',
  },
  clearButton: { paddingHorizontal: 8 },
  clearButtonText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 12,
  },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  itemAccent: {
    width: 3,
    backgroundColor: '#c2410c',
  },
  itemZerado: {
    opacity: 0.5,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemInfo: { flex: 1 },
  itemNome: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 2,
  },
  itemLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  itemLabelAlerta: {
    color: '#c2410c',
    fontWeight: '600',
  },
  itemRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  itemQtd: {
    fontSize: 18,
    color: '#1e3a5f',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  itemQtdAlerta: { color: '#c2410c' },
  itemQtdLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: -2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  inputRetirada: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  baixarButton: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  baixarButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  entradaButton: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  entradaButtonText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '600',
  },
  itemCritico: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  totalItens: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});