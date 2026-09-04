import { useState, useEffect } from "react";
import { useAuth } from "../auth";
import { API_BASE } from "../config";
import { Camera, Save, Trash2, ShieldCheck, Languages, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [language, setLanguage] = useState(user?.language || "English");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    if (user?.role === "inspector" || user?.role === "government") {
      fetch(`${API_BASE}/inspector/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setLiveStats(data.stats);
      })
      .catch(console.error);
    }
  }, [user?.role, token]);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, language })
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to completely delete your account and all reports? This action cannot be undone. All your data will be permanently wiped according to GDPR standards.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        logout();
        navigate("/login");
      } else {
        alert("Failed to delete account");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-ink">My Profile</h1>
      <p className="mt-2 text-slate-600">Manage your personal information and preferences.</p>

      {/* Profile Card */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-sea to-teal-500"></div>
        <div className="relative px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-200">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">
                  <UserCircle size={60} strokeWidth={1} />
                </div>
              )}
              <button className="absolute bottom-0 left-0 right-0 grid place-items-center bg-black/50 py-1 text-white hover:bg-black/70 transition" title="Upload new photo (Coming soon)">
                <Camera size={14} />
              </button>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <input 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-sea focus:ring-1 focus:ring-sea"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Preferred Language</label>
                <select 
                  value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-sea focus:ring-1 focus:ring-sea bg-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="French">French</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-sea px-5 py-2 text-sm font-semibold text-white hover:bg-ink transition">
                  <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-ink">{user?.name || "No Name Provided"}</h2>
              <p className="font-medium text-slate-500">{user?.phone || user?.email}</p>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <Languages className="text-sea shrink-0" size={24} />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Language</p>
                    <p className="font-medium text-slate-800">{user?.language || "English"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <ShieldCheck className="text-teal-600 shrink-0" size={24} />
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Account Role</p>
                    <p className="font-medium capitalize text-slate-800">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Travel & Report Statistics */}
      {user?.role === "tourist" ? (
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-ink">My Report Statistics</h3>
          <p className="mt-1 text-sm text-slate-500">
            Track the status of concerns you've reported.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-3xl font-bold text-slate-700">{user?.stats?.total || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-500">Total Reports</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-center border border-amber-100">
              <p className="text-3xl font-bold text-amber-600">{user?.stats?.pending_count || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-amber-700">Pending Review</p>
            </div>
            <div className="rounded-xl bg-teal-50 p-4 text-center border border-teal-100">
              <p className="text-3xl font-bold text-teal-600">{user?.stats?.valid_count || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-teal-700">Verified True</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4 text-center border border-rose-100">
              <p className="text-3xl font-bold text-rose-600">{user?.stats?.invalid_count || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-rose-700">Verified False</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border bg-slate-900 p-6 shadow-sm text-white">
          <h3 className="text-lg font-bold">Jurisdiction Overview ({user?.region || "All"})</h3>
          <p className="mt-1 text-sm text-slate-400">
            Real-time compliance load in your assigned area.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-800 p-4 text-center border border-slate-700">
              <p className="text-3xl font-bold text-white">{liveStats?.total_reports || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-400">Total Problems</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-4 text-center border border-amber-500/20">
              <p className="text-3xl font-bold text-amber-400">{liveStats?.pending_reports || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-amber-400/80">In Review</p>
            </div>
            <div className="rounded-xl bg-teal-500/10 p-4 text-center border border-teal-500/20">
              <p className="text-3xl font-bold text-teal-400">{liveStats?.resolved_reports || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-teal-400/80">Verified</p>
            </div>
            <div className="rounded-xl bg-rose-500/10 p-4 text-center border border-rose-500/20">
              <p className="text-3xl font-bold text-rose-400">{liveStats?.discarded_reports || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-rose-400/80">Discarded</p>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-rose-700">
          <Trash2 size={20} /> Danger Zone
        </h3>
        <p className="mt-2 text-sm text-rose-900/80">
          Permanently delete your YatraSetu account and all associated data (including reports, location data, and profile info). This action is irreversible.
        </p>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting Data..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}
