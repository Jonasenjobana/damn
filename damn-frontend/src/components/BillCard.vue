<template>
  <div class="bill-card">
    <div class="bill-header">
      <el-tag size="small">{{ bill.type }}</el-tag>
      <span class="bill-date">{{ bill.date }}</span>
      <el-button
        class="delete-btn"
        type="danger"
        size="small"
        text
        @click="handleDelete"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
    <div class="bill-items">
      <div v-for="(item, index) in parsedItems" :key="index" class="bill-item">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
      </div>
    </div>
    <div class="bill-footer">
      <div class="total">
        <span class="label">总计</span>
        <span class="price">¥{{ total.toFixed(2) }}</span>
      </div>
      <div v-if="bill.from" class="from">
        <span>支付方式: {{ bill.from }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import type { Bill, BillItem } from '@/types/llm';
import { inject } from 'vue';

interface Props {
  bill: Bill;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [id: number];
}>();

const parsedItems = computed((): BillItem[] => {
  if (props.bill.itemsJson) {
    try {
      return JSON.parse(props.bill.itemsJson);
    } catch (e) {
      return [];
    }
  }
  return [];
});

const total = computed(() => {
  return parsedItems.value.reduce((sum, item) => sum + item.price, 0);
});

const handleDelete = () => {
  emit('delete', props.bill.id);
};
</script>

<style scoped>
.bill-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  max-width: 500px;
}

.bill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bill-date {
  color: #606266;
  font-size: 13px;
  flex: 1;
}

.delete-btn {
  flex-shrink: 0;
}

.bill-items {
  margin-bottom: 12px;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.item-name {
  color: #303133;
  font-size: 14px;
}

.item-price {
  color: #f56c6c;
  font-size: 14px;
  font-weight: 600;
}

.bill-footer {
  border-top: 1px dashed #dcdfe6;
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-footer .total {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bill-footer .total .label {
  color: #606266;
  font-size: 13px;
}

.bill-footer .total .price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.bill-footer .from {
  color: #909399;
  font-size: 12px;
}
</style>
