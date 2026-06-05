import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { SHOP_ITEMS, ShopItem } from '../../data/shopItems';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ShopOverlay({ visible, onClose }: Props) {
  const { walletGold, inventory, purchaseItem, equipTitle } = useApp();

  const consumables = SHOP_ITEMS.filter(i => i.kind === 'consumable');
  const titles = SHOP_ITEMS.filter(i => i.kind === 'title');

  function BuyButton({ item }: { item: ShopItem }) {
    const afford = walletGold >= item.cost;
    return (
      <TouchableOpacity
        style={[styles.buyBtn, !afford && styles.buyBtnOff]}
        onPress={() => purchaseItem(item.id)}
        disabled={!afford}
      >
        <Text style={[styles.buyTxt, !afford && styles.buyTxtOff]}>🪙 {item.cost}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>🛒 상점</Text>
            <View style={styles.wallet}>
              <Text style={styles.walletTxt}>🪙 {walletGold.toLocaleString()}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 소모품 */}
            <Text style={styles.sectionLabel}>소모품</Text>
            {consumables.map(item => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <View style={styles.rowInfo}>
                  <View style={styles.rowNameLine}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    {item.id === 'freeze' && inventory.streakFreezes > 0 && (
                      <Text style={styles.ownCount}>보유 {inventory.streakFreezes}개</Text>
                    )}
                  </View>
                  <Text style={styles.rowDesc}>{item.desc}</Text>
                </View>
                <BuyButton item={item} />
              </View>
            ))}

            {/* 칭호 */}
            <Text style={styles.sectionLabel}>칭호</Text>
            {titles.map(item => {
              const owned = inventory.ownedTitles.includes(item.id);
              const equipped = inventory.equippedTitle === item.id;
              return (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.rowIcon}>{item.icon}</Text>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={styles.rowDesc}>{item.desc}</Text>
                  </View>
                  {!owned ? (
                    <BuyButton item={item} />
                  ) : equipped ? (
                    <TouchableOpacity style={styles.equippedBtn} onPress={() => equipTitle(null)}>
                      <Text style={styles.equippedTxt}>착용 중</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.equipBtn} onPress={() => equipTitle(item.id)}>
                      <Text style={styles.equipTxt}>착용</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            <Text style={styles.footHint}>
              금화는 '업무(work)' 활동과 메인 퀘스트 마일스톤으로 모을 수 있어요.
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>닫기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1E1E2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 20, maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#555',
    borderRadius: 2, alignSelf: 'center', marginVertical: 12,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#F0C070' },
  wallet: {
    backgroundColor: 'rgba(80,60,0,0.6)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)',
    paddingHorizontal: 14, paddingVertical: 6,
  },
  walletTxt: { color: '#FFD700', fontSize: 15, fontWeight: 'bold' },
  sectionLabel: {
    fontSize: 11, color: '#666', fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
    marginTop: 8, marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2A2A3E', borderRadius: 12,
    padding: 12, marginBottom: 8,
  },
  rowIcon: { fontSize: 26, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowName: { fontSize: 15, color: '#EEE', fontWeight: '600' },
  ownCount: {
    fontSize: 10, color: '#7AB8FF',
    backgroundColor: 'rgba(120,184,255,0.12)',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden',
  },
  rowDesc: { fontSize: 11, color: '#999', marginTop: 3 },
  buyBtn: {
    backgroundColor: '#F0C070', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, minWidth: 60, alignItems: 'center',
  },
  buyBtnOff: { backgroundColor: '#3A3A4A' },
  buyTxt: { color: '#1E1E2E', fontWeight: 'bold', fontSize: 13 },
  buyTxtOff: { color: '#777' },
  equipBtn: {
    backgroundColor: '#2A2A5E', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  equipTxt: { color: '#C0B0F0', fontWeight: '600', fontSize: 13 },
  equippedBtn: {
    backgroundColor: 'rgba(240,192,112,0.15)', borderRadius: 10,
    borderWidth: 1, borderColor: '#F0C070',
    paddingHorizontal: 12, paddingVertical: 7,
  },
  equippedTxt: { color: '#F0C070', fontWeight: '700', fontSize: 12 },
  footHint: {
    fontSize: 11, color: '#666', textAlign: 'center',
    marginTop: 8, marginBottom: 4, lineHeight: 17,
  },
  closeBtn: {
    marginTop: 10, backgroundColor: '#2A2A3E',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  closeTxt: { color: '#F0C070', fontSize: 15, fontWeight: '600' },
});
