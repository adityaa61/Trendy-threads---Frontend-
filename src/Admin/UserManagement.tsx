import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { fetchUsers, addUser, deleteUser } from "@/Redux/slices/adminSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.admin);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await dispatch(addUser(form)).unwrap();
      toast.success("User added successfully");

      setForm({ name: "", email: "", password: "", role: "customer" });
      dispatch(fetchUsers());
    } catch (err: any) {
      toast.error(err?.message || "Failed to add user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success("User deleted successfully");
      dispatch(fetchUsers());
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">User Management</h1>

      {/* ADD USER */}
      <Card className="mb-6 w-full max-w-xl">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border rounded p-2 w-full"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>

          <Button
            onClick={handleAddUser}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            {loading ? "Adding..." : "Add User"}
          </Button>
        </CardContent>
      </Card>

      {/* USERS TABLE */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading users...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-4">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No users found</p>
          ) : (
            // 🔥 Responsive table wrapper
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-2 font-semibold">Name</th>
                    <th className="p-2 font-semibold">Email</th>
                    <th className="p-2 font-semibold">Role</th>
                    <th className="p-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 capitalize">{u.role}</td>

                      <td className="p-2 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
