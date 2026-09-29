import React from "react";
import { User, MapPin, Calendar, Clock, ShieldAlert, Plus, Trash2, Tag, AlertTriangle } from "lucide-react";

export default function FIRFields({ fir, onChange, readOnly = false }) {
  if (!fir) return null;

  const handleComplainantChange = (field, val) => {
    onChange({
      ...fir,
      complainant: {
        ...(fir.complainant || {}),
        [field]: val
      }
    });
  };

  const handleIncidentChange = (field, val) => {
    onChange({
      ...fir,
      incident: {
        ...(fir.incident || {}),
        [field]: val
      }
    });
  };

  const handleAccusedChange = (index, field, val) => {
    const list = [...(fir.accused || [])];
    list[index] = { ...list[index], [field]: val };
    onChange({ ...fir, accused: list });
  };

  const addAccused = () => {
    const list = [...(fir.accused || []), { name: "", description: "", relationship: "" }];
    onChange({ ...fir, accused: list });
  };

  const removeAccused = (index) => {
    const list = (fir.accused || []).filter((_, i) => i !== index);
    onChange({ ...fir, accused: list });
  };

  const handlePropertyChange = (index, field, val) => {
    const list = [...(fir.property || [])];
    list[index] = { ...list[index], [field]: val };
    onChange({ ...fir, property: list });
  };

  const addProperty = () => {
    const list = [...(fir.property || []), { item: "", value: "", description: "" }];
    onChange({ ...fir, property: list });
  };

  const removeProperty = (index) => {
    const list = (fir.property || []).filter((_, i) => i !== index);
    onChange({ ...fir, property: list });
  };

  const handleSectionsChange = (val) => {
    const sectionsArray = val.split(",").map(s => s.trim()).filter(Boolean);
    onChange({ ...fir, sections: sectionsArray });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* 1. Complainant Details */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
            <User className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">1. Complainant / Informant Particulars</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Legal Name *</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.complainant?.name || ""}
              onChange={(e) => handleComplainantChange("name", e.target.value)}
              placeholder="e.g. K. Subramaniam"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Father / Spouse Name</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.complainant?.fatherOrHusbandName || ""}
              onChange={(e) => handleComplainantChange("fatherOrHusbandName", e.target.value)}
              placeholder="If stated"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age / Phone</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                disabled={readOnly}
                value={fir.complainant?.age || ""}
                onChange={(e) => handleComplainantChange("age", e.target.value)}
                placeholder="Age"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
              />
              <input
                type="text"
                disabled={readOnly}
                value={fir.complainant?.phone || ""}
                onChange={(e) => handleComplainantChange("phone", e.target.value)}
                placeholder="Phone"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Residential Address *</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.complainant?.address || ""}
              onChange={(e) => handleComplainantChange("address", e.target.value)}
              placeholder="e.g. No. 14, 2nd Main Road, Anna Nagar, Chennai"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>
        </div>
      </div>

      {/* 2. Incident Details */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Occurrence of Offence</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reported Crime Type *</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.incident?.crimeType || ""}
              onChange={(e) => handleIncidentChange("crimeType", e.target.value)}
              placeholder="e.g. Housebreaking & Theft"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date of Occurrence *</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.incident?.date || ""}
              onChange={(e) => handleIncidentChange("date", e.target.value)}
              placeholder="e.g. 2026-08-20"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Time of Occurrence *</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.incident?.time || ""}
              onChange={(e) => handleIncidentChange("time", e.target.value)}
              placeholder="e.g. 10:30 PM"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Exact Place of Occurrence *</label>
            <input
              type="text"
              disabled={readOnly}
              value={fir.incident?.location || ""}
              onChange={(e) => handleIncidentChange("location", e.target.value)}
              placeholder="e.g. Residence at Anna Nagar 2nd Main Road"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Incident Summary / Modus Operandi</label>
            <textarea
              rows={2}
              disabled={readOnly}
              value={fir.incident?.description || ""}
              onChange={(e) => handleIncidentChange("description", e.target.value)}
              placeholder="Brief description of the event"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-blue-500 disabled:opacity-75"
            />
          </div>
        </div>
      </div>

      {/* 3. Accused Particulars */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">3. Accused Particulars</h4>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={addAccused}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-700/50 hover:bg-blue-900/70 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Accused
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {(fir.accused || []).map((acc, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-3">
                <input
                  type="text"
                  disabled={readOnly}
                  value={acc.name || ""}
                  onChange={(e) => handleAccusedChange(idx, "name", e.target.value)}
                  placeholder="Accused Name / Unknown"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="md:col-span-5">
                <input
                  type="text"
                  disabled={readOnly}
                  value={acc.description || ""}
                  onChange={(e) => handleAccusedChange(idx, "description", e.target.value)}
                  placeholder="Physical description / Vehicle / Identifying marks"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  disabled={readOnly}
                  value={acc.relationship || ""}
                  onChange={(e) => handleAccusedChange(idx, "relationship", e.target.value)}
                  placeholder="Relation (e.g. Stranger)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                />
              </div>
              {!readOnly && (
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeAccused(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Properties Stolen / Involved */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Tag className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">4. Properties Stolen / Involved</h4>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={addProperty}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/70 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Property
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {(fir.property || []).map((prop, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4">
                <input
                  type="text"
                  disabled={readOnly}
                  value={prop.item || ""}
                  onChange={(e) => handlePropertyChange(idx, "item", e.target.value)}
                  placeholder="Property Item (e.g. Gold Jewellery)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  disabled={readOnly}
                  value={prop.value || ""}
                  onChange={(e) => handlePropertyChange(idx, "value", e.target.value)}
                  placeholder="Value (e.g. Rs. 45,000)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono font-semibold"
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  disabled={readOnly}
                  value={prop.description || ""}
                  onChange={(e) => handlePropertyChange(idx, "description", e.target.value)}
                  placeholder="Identifying description / weight"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
                />
              </div>
              {!readOnly && (
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeProperty(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Suggested Statutory Sections */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
            <Tag className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">5. Applicable Penal Sections (IPC / BNS)</h4>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">Review and verify the statutory sections corresponding to the offence:</p>
        <input
          type="text"
          disabled={readOnly}
          value={(fir.sections || []).join(", ")}
          onChange={(e) => handleSectionsChange(e.target.value)}
          placeholder="e.g. IPC 457, IPC 380, BNS 331(4)"
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-indigo-300 font-mono font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-75"
        />
      </div>

      {/* 6. Formal Narrative */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">6. Full Police FIR Narrative (English)</h4>
        <textarea
          rows={5}
          disabled={readOnly}
          value={fir.narrative || ""}
          onChange={(e) => onChange({ ...fir, narrative: e.target.value })}
          placeholder="Formal English First Information Statement"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500 disabled:opacity-75 font-sans"
        />
      </div>

    </div>
  );
}
