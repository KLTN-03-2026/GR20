import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from 'src/utils/http';

interface TerminateContractModalProps {
  contractId: number;
  contractCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TerminateContractModal({
  contractId,
  contractCode,
  isOpen,
  onClose,
}: TerminateContractModalProps) {
  const queryClient = useQueryClient();

  const terminateMutation = useMutation({
    mutationFn: () => http.delete(`/api/contracts/${contractId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', contractId.toString()] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#FFF7ED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <span style={{ fontSize: 32, color: '#F97316' }}>⚠️</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1E293B',
          marginBottom: 16,
        }}>
          Xác nhận chấm dứt hợp đồng
        </h2>

        {/* Message */}
        <p style={{
          fontSize: 14,
          color: '#64748B',
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          Bạn có chắc chắn muốn chấm dứt hợp đồng{' '}
          <strong style={{ color: '#1E293B' }}>#{contractCode}</strong> không?
        </p>
        <p style={{
          fontSize: 14,
          color: '#64748B',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          Hợp đồng sẽ chuyển sang trạng thái{' '}
          <strong style={{ color: '#EF4444' }}>TERMINATED</strong> và không thể khôi phục.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 9999,
              border: 'none',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => terminateMutation.mutate()}
            disabled={terminateMutation.isPending}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 9999,
              border: 'none',
              backgroundColor: '#F97316',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              opacity: terminateMutation.isPending ? 0.5 : 1,
            }}
          >
            {terminateMutation.isPending ? 'Đang xử lý...' : 'Xác nhận chấm dứt'}
          </button>
        </div>
      </div>
    </div>
  );
}