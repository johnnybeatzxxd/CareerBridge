import { ArrowDownToLine, ArrowUpRight, Banknote, Landmark, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Badge,
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  EmptyState,
  PageHeader,
  Skeleton,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import WithdrawDialog from './WithdrawDialog.jsx';
import { formatMoney, formatTransactionDate } from './walletUtils.js';
import { useWallet } from './useWallet.js';

export default function WalletPage() {
  const { user } = useAuth();
  const { wallet, loading, error, withdraw } = useWallet();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  if (user.role !== 'JOB_SEEKER') return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Job seeker workspace"
        title="Wallet"
        subtitle="Track payments from employers and withdraw your available funds."
        actions={(
          <Button disabled={Number(wallet.availableBalance) <= 0} onClick={() => setWithdrawOpen(true)}>
            <ArrowDownToLine size={16} />
            Withdraw
          </Button>
        )}
      />

      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 xl:grid-cols-3">
        <BalanceCard icon={WalletCards} label="Available balance" loading={loading} value={wallet.availableBalance} primary />
        <BalanceCard icon={Banknote} label="Total earned" loading={loading} value={wallet.totalEarned} />
        <BalanceCard icon={Landmark} label="Total withdrawn" loading={loading} value={wallet.totalWithdrawn} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#17211e]">Transaction history</h2>
          <p className="mt-1 text-sm text-[#74807a]">Payments and withdrawals are recorded here immediately.</p>
        </div>
        {loading ? (
          <div className="border border-[#d8dfda] bg-white p-5">
            {[1, 2, 3].map((item) => <Skeleton className="mb-3 h-14" key={item} />)}
          </div>
        ) : wallet.transactions.length ? (
          <DataTable className="min-w-[900px]" containerClassName="rounded-none border-[#d8dfda]">
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Transaction</DataTableHead>
                <DataTableHead>Details</DataTableHead>
                <DataTableHead>Date</DataTableHead>
                <DataTableHead>Status</DataTableHead>
                <DataTableHead align="right">Amount</DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {wallet.transactions.map((transaction) => {
                const payment = transaction.type === 'PAYMENT';
                return (
                  <DataTableRow key={transaction.id}>
                    <DataTableCell>
                      <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 place-items-center ${payment ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {payment ? <ArrowDownToLine size={17} /> : <ArrowUpRight size={17} />}
                        </span>
                        <div>
                          <p className="font-bold text-[#17211e]">{payment ? 'Employer payment' : 'Withdrawal'}</p>
                          <p className="mt-1 text-xs text-[#74807a]">{payment ? transaction.employerName : transaction.payoutMethod?.replaceAll('_', ' ')}</p>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <p className="font-semibold text-[#405049]">{payment ? transaction.jobTitle : transaction.payoutAccount}</p>
                      {transaction.note && <p className="mt-1 max-w-xs truncate text-xs text-[#7a8580]">{transaction.note}</p>}
                    </DataTableCell>
                    <DataTableCell>{formatTransactionDate(transaction.createdAt)}</DataTableCell>
                    <DataTableCell><Badge variant="success" dot>{transaction.status}</Badge></DataTableCell>
                    <DataTableCell align="right" className={`font-bold ${payment ? 'text-emerald-700' : 'text-[#405049]'}`}>
                      {payment ? '+' : '-'}{formatMoney(transaction.amount)}
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
        ) : (
          <div className="border border-[#d8dfda] bg-white">
            <EmptyState icon={WalletCards} title="No transactions yet" description="Payments from employers will appear in your wallet after you are hired." />
          </div>
        )}
      </section>

      <WithdrawDialog
        balance={wallet.availableBalance}
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onWithdraw={withdraw}
      />
    </div>
  );
}

function BalanceCard({ icon: Icon, label, loading, primary = false, value }) {
  return (
    <div className={`border p-6 ${primary ? 'border-[#176b52] bg-[#15372d] text-white' : 'border-[#d8dfda] bg-white text-[#17211e]'}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-semibold ${primary ? 'text-emerald-100' : 'text-[#68736e]'}`}>{label}</p>
        <Icon size={20} className={primary ? 'text-emerald-200' : 'text-[#176b52]'} />
      </div>
      {loading ? <Skeleton className="mt-5 h-9 w-40" /> : <p className="mt-5 text-3xl font-bold">{formatMoney(value)}</p>}
    </div>
  );
}
