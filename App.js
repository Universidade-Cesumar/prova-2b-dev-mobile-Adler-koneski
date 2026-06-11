import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, FlatList, ActivityIndicator,
  Alert, RefreshControl, StatusBar
} from 'react-native';

const API_URL = 'https://6a2b34d9b687a7d5cbc4f27f.mockapi.io/api/v1/materiais';

const getSaudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
};

const getDataFormatada = () => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  });
};

export default function App() {
  const [materiais, setMateriais] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisivel, setFormVisivel] = useState(true);
  const [busca, setBusca] = useState('');

  const buscarMateriais = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      Alert.alert('Erro', 'Não foi possível carregar o estoque.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(API_URL);
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
      Alert.alert('Atenção', 'Preencha o nome e a quantidade!');
      return;
    }
    if (isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      Alert.alert('Atenção', 'A quantidade deve ser um número maior que zero!');
      return;
    }

    setCadastrando(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), quantidade: Number(quantidade) }),
      });
      const novo = await response.json();
      setMateriais((prev) => [...prev, novo]);
      setNome('');
      setQuantidade('');
      setFormVisivel(false);
      Alert.alert('✅ Sucesso', `"${novo.nome}" cadastrado com ${novo.quantidade} unidades!`);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o material.');
    } finally {
      setCadastrando(false);
    }
  };

  useEffect(() => {
    buscarMateriais();
  }, []);

  const totalUnidades = materiais.reduce(
    (acc, item) => acc + Number(item.quantidade || 0), 0
  );

  const materiaisFiltrados = materiais
    .filter(item => item.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏥</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Almoxarifado</Text>
          <Text style={styles.headerSubtitle}>{getSaudacao()}, Camila 👋</Text>
          <Text style={styles.headerSubtitle}>{getDataFormatada()}</Text>
        </View>
      </View>

      {/* Cards de resumo */}
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>{materiais.length}</Text>
          <Text style={styles.cardLabel}>Tipos de{'\n'}Material</Text>
        </View>
        <View style={[styles.card, styles.cardDestaque]}>
          <Text style={[styles.cardNumber, styles.cardNumberDestaque]}>{totalUnidades}</Text>
          <Text style={[styles.cardLabel, styles.cardLabelDestaque]}>Total de{'\n'}Unidades</Text>
        </View>
      </View>

      {/* Toggle formulário */}
      <TouchableOpacity
        style={styles.toggleFormButton}
        onPress={() => setFormVisivel(!formVisivel)}
      >
        <Text style={styles.toggleFormText}>
          {formVisivel ? '▲ Ocultar Formulário' : '▼ Novo Material'}
        </Text>
      </TouchableOpacity>

      {/* Formulário de cadastro */}
      {formVisivel && (
        <View style={styles.form}>
          <TextInput
            testID="input-nome"
            style={styles.input}
            placeholder="Nome do material (ex: Luva cirúrgica)"
            placeholderTextColor="#aaa"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            testID="input-quantidade"
            style={styles.input}
            placeholder="Quantidade"
            placeholderTextColor="#aaa"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
          <TouchableOpacity
            testID="btn-cadastrar"
            style={[styles.button, cadastrando && styles.buttonDisabled]}
            onPress={cadastrarMaterial}
            disabled={cadastrando}
          >
            {cadastrando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>＋ Cadastrar Material</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Cabeçalho da lista com busca */}
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>Estoque Atual</Text>
        <TouchableOpacity onPress={buscarMateriais} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻ Atualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar material..."
          placeholderTextColor="#aaa"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de materiais */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.loadingText}>Carregando estoque...</Text>
        </View>
      ) : (
        <FlatList
          testID="lista-materiais"
          data={materiaisFiltrados}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1565C0']}
            />
          }
          renderItem={({ item }) => {
            const estoqueBaixo = Number(item.quantidade) <= 20;
            return (
              <View style={[styles.item, estoqueBaixo && styles.itemAlerta]}>
                <View style={[styles.itemIconContainer, estoqueBaixo && styles.itemIconContainerAlerta]}>
                  <Text style={styles.itemIcon}>{estoqueBaixo ? '⚠️' : '💊'}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={[styles.itemLabel, estoqueBaixo && styles.itemLabelAlerta]}>
                    {estoqueBaixo ? '⚠️ Estoque baixo!' : 'Material de consumo'}
                  </Text>
                </View>
                <View style={[styles.qtdBadge, estoqueBaixo && styles.qtdBadgeAlerta]}>
                  <Text style={styles.itemQtd}>{item.quantidade}</Text>
                  <Text style={styles.qtdLabel}>un</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>
                {busca.length > 0 ? 'Nenhum material encontrado.' : 'Nenhum material cadastrado.'}
              </Text>
              <Text style={styles.emptySubText}>
                {busca.length > 0 ? `Sem resultados para "${busca}"` : 'Use o formulário acima para adicionar.'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1565C0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: { fontSize: 32 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#90CAF9',
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardDestaque: { backgroundColor: '#1565C0' },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  cardNumberDestaque: { color: '#fff' },
  cardLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  cardLabelDestaque: { color: '#90CAF9' },
  toggleFormButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleFormText: {
    color: '#1565C0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  button: {
    backgroundColor: '#1565C0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#90CAF9' },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  refreshText: {
    color: '#1565C0',
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    color: '#999',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  itemAlerta: {
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconContainerAlerta: {
    backgroundColor: '#FFEBEE',
  },
  itemIcon: { fontSize: 20 },
  itemInfo: { flex: 1 },
  itemNome: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
  itemLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemLabelAlerta: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  qtdBadge: {
    backgroundColor: '#1565C0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 48,
  },
  qtdBadgeAlerta: {
    backgroundColor: '#E53935',
  },
  itemQtd: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  qtdLabel: {
    fontSize: 10,
    color: '#90CAF9',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 4,
  },
});