import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Sparkles } from 'lucide-react';
import { Button, QueueTicket } from '@queuesmart/shared';

export interface PrintableTokenSlipProps {
  ticket: QueueTicket;
  onDone?: () => void;
}

export const PrintableTokenSlip: React.FC<PrintableTokenSlipProps> = ({ ticket, onDone }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Visual Preview Container */}
      <div
        id="printable-slip"
        className="mx-auto w-[280px] p-6 bg-white text-slate-900 border border-slate-300 rounded-2xl shadow-lg text-center font-mono text-xs space-y-3"
      >
        <div className="border-b border-dashed border-slate-400 pb-2">
          <h2 className="font-extrabold text-sm uppercase tracking-wider">
            {ticket.branchName}
          </h2>
          <p className="text-[10px] text-slate-600">Smart Queue Management</p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {new Date(ticket.joinedAt).toLocaleDateString()} •{' '}
            {new Date(ticket.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="py-2">
          <span className="text-[10px] uppercase text-slate-500 block">Your Token Number</span>
          <span className="text-4xl font-black block tracking-tight my-1">
            {ticket.tokenNo}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 uppercase">
            {ticket.priorityTier} TIER
          </span>
        </div>

        <div className="border-t border-b border-dashed border-slate-400 py-2 text-left space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Service:</span>
            <span className="font-bold text-right truncate max-w-[150px]">{ticket.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Citizen:</span>
            <span className="font-semibold">{ticket.userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ahead in line:</span>
            <span className="font-bold">{ticket.peopleAhead} people</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Est. Wait:</span>
            <span className="font-bold">~{ticket.etaMinutes} mins</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col items-center">
          <QRCodeSVG
            value={`QUEUESMART:WALKIN:${ticket.id}:${ticket.tokenNo}`}
            size={110}
            level="M"
          />
          <p className="text-[9px] text-slate-500 mt-2">
            Please watch the lobby display screen for your token call.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          size="sm"
          variant="primary"
          onClick={handlePrint}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Thermal Slip
        </Button>
        {onDone && (
          <Button size="sm" variant="outline" onClick={onDone}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};
