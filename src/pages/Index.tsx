import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Plus,
  CircleHelp,
  Paperclip,
  User,
  HardDrive,
  Database,
  Pencil,
  Link as LinkIcon,
  LogOut,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import backgroundImage from "@/assets/background.png";
import { Heart } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// 🔥 TYPES ATUALIZADOS
type ScriptItem = {
  id: number;
  title: string;
  text: string;
  created_at?: string;
  updated_at?: string;
};

type ContactItem = {
  id: number;
  title: string;
  text: string;
  phones?: string[];
  whatsapp?: string[];
  emails?: string[];
  created_at?: string;
  updated_at?: string;
};

type FAQItem = {
  id: number;
  title: string;
  text: string;
  author?: string | null;
  file_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type DriverItem = {
  id: number;
  equipment: string;
  author: string;
  file_url: string;
  created_at?: string;
  updated_at?: string;
};

type ImportantLinkItem = {
  id: number;
  system: string;
  url: string;
  created_at?: string;
  updated_at?: string;
};

type FormType = "script" | "contact" | "faq" | "driver" | "link";



const FAQ_BUCKET = "faq-files";
const DRIVER_BUCKET = "driver-files";


const formatDateBR = (date: string) => {
  if (!date) return "-";

  // remove microssegundos (JS não suporta direito)
  const clean = date.split(".")[0];

  // transforma em ISO válido
  const iso = clean.replace(" ", "T") + "Z";

  const d = new Date(iso);

  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Index = () => {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [importantLinks, setImportantLinks] = useState<ImportantLinkItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [formType, setFormType] = useState<FormType>("script");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [phones, setPhones] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emails, setEmails] = useState("");

  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [equipment, setEquipment] = useState("");
  const [driverFile, setDriverFile] = useState<File | null>(null);

  const [systemName, setSystemName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setText("");
    setPhones("");
    setWhatsapp("");
    setEmails("");
    setAuthor("");
    setFile(null);
    setEquipment("");
    setDriverFile(null);
    setSystemName("");
    setLinkUrl("");
    setIsEditing(false);
    setEditingId(null);
  };

  const sendToWhatsApp = (text: string) => {
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank");
};

  // FAVORITOS
const [favorites, setFavorites] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);


useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
  getUser();
}, []);

const loadFavorites = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    toast.error("Erro ao carregar favoritos");
    return;
  }

  setFavorites(data || []);
};

const isFavorite = (itemId: number, type: string) => {
  return favorites.some(
    (f) => f.item_id === itemId && f.item_type === type
  );
};

const toggleFavorite = async (itemId: number, type: string) => {
  if (!user) {
    toast.error("Usuário não autenticado");
    return;
  }

  const existing = favorites.find(
    (f) => f.item_id === itemId && f.item_type === type
  );

  try {
    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;

      setFavorites((prev) =>
        prev.filter((f) => f.id !== existing.id)
      );
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .insert([
          {
            user_id: user.id,
            item_id: itemId,
            item_type: type,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setFavorites((prev) => [...prev, data]);
    }
  } catch (err: any) {
    console.error(err);
    toast.error("Erro ao favoritar");
  }
};


const sortByFavorite = (items: any[], type: string) => {
  return [...items].sort((a, b) => {
    const aFav = isFavorite(a.id, type) ? 1 : 0;
    const bFav = isFavorite(b.id, type) ? 1 : 0;

    return bFav - aFav; // favoritos primeiro
  });
};



const getZendeskTicketId = () => {
  try {
    const url = window.location.href;
    const match = url.match(/tickets\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const sendToZendesk = async (script: string) => {
  const ticketId = getZendeskTicketId();

  if (!ticketId) {
    toast.error("ID do ticket não encontrado na URL");
    return;
  }

  try {
    const response = await fetch("/api/zendesk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId,
        message: script,
      }),
    });

    if (!response.ok) throw new Error();

    toast.success("Script enviado para o Zendesk 🚀");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao enviar para o Zendesk");
  }
};

  const openNewItemDialog = (type: FormType) => {
    resetForm();
    setFormType(type);
    setIsEditing(false);
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleEdit = (
    type: FormType,
    item: ScriptItem | ContactItem | FAQItem | DriverItem | ImportantLinkItem,
  ) => {
    resetForm();
    setFormType(type);
    setIsEditing(true);
    setEditingId(item.id);
    setOpenDialog(true);

    if (type === "script") {
      const script = item as ScriptItem;
      setTitle(script.title);
      setText(script.text);
    }

    if (type === "contact") {
      const contact = item as ContactItem;
      setTitle(contact.title);
      setText(contact.text);
      setPhones((contact.phones || []).join(", "));
      setWhatsapp((contact.whatsapp || []).join(", "));
      setEmails((contact.emails || []).join(", "));
    }

    if (type === "faq") {
      const faq = item as FAQItem;
      setTitle(faq.title);
      setText(faq.text);
      setAuthor(faq.author || "");
    }

    if (type === "driver") {
      const driver = item as DriverItem;
      setEquipment(driver.equipment);
      setAuthor(driver.author);
    }

    if (type === "link") {
      const link = item as ImportantLinkItem;
      setSystemName(link.system);
      setLinkUrl(link.url);
    }
  };

  const toArray = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const sanitizeFileName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const toWhatsappUrl = (value: string) => {
    const number = value.replace(/\D/g, "");
    return `https://wa.me/${number}`;
  };

  const handleCopy = async (value: string, id: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast.success("Copiado para a área de transferência!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Não foi possível copiar o conteúdo.");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao sair:", error);
      toast.error(error?.message || "Erro ao sair da conta.");
    }
  };

  const getFileNameFromUrl = (url?: string | null) => {
    if (!url) return "";
    try {
      const pathname = new URL(url).pathname;
      return decodeURIComponent(pathname.split("/").pop() || "Arquivo");
    } catch {
      return "Arquivo";
    }
  };

  const loadData = async () => {
    setLoading(true);

    try {
      const [scriptsRes, contactsRes, faqsRes, driversRes, linksRes] =
        await Promise.all([
          supabase.from("scripts").select("*").order("id", { ascending: false }),
          supabase.from("contacts").select("*").order("id", { ascending: false }),
          supabase.from("faqs").select("*").order("id", { ascending: false }),
          supabase.from("drivers").select("*").order("id", { ascending: false }),
          supabase
            .from("important_links")
            .select("*")
            .order("id", { ascending: false }),
        ]);

      if (scriptsRes.error) throw scriptsRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (faqsRes.error) throw faqsRes.error;
      if (driversRes.error) throw driversRes.error;
      if (linksRes.error) throw linksRes.error;

      setScripts((scriptsRes.data as ScriptItem[]) || []);
      setContacts((contactsRes.data as ContactItem[]) || []);
      setFaqs((faqsRes.data as FAQItem[]) || []);
      setDrivers((driversRes.data as DriverItem[]) || []);
      setImportantLinks((linksRes.data as ImportantLinkItem[]) || []);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error(error?.message || "Erro ao carregar dados do Supabase.");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (user) {
    loadData();
    loadFavorites();
  }
}, [user]);

  const handleSave = async () => {
  const now = new Date().toISOString();

  if (formType === "driver") {
    if (!equipment.trim() || !author.trim()) {
      toast.error("Preencha equipamento e autor.");
      return;
    }

    if (!isEditing && !driverFile) {
      toast.error("Selecione o arquivo do driver.");
      return;
    }
  } else if (formType === "link") {
    if (!systemName.trim() || !linkUrl.trim()) {
      toast.error("Preencha sistema e link.");
      return;
    }
  } else {
    if (!title.trim() || !text.trim()) {
      toast.error("Preencha título e conteúdo.");
      return;
    }

    if (formType === "faq" && !author.trim()) {
      toast.error("Informe o autor da FAQ.");
      return;
    }
  }

  setSaving(true);

  try {
    // =========================
    // SCRIPTS
    // =========================
    if (formType === "script") {
      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from("scripts")
          .update({
            title: title.trim(),
            text: text.trim(),
            updated_at: now,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        setScripts((prev) =>
          prev.map((item) =>
            item.id === editingId ? (data as ScriptItem) : item,
          ),
        );

        toast.success("Script atualizado!");
      } else {
        const { data, error } = await supabase
          .from("scripts")
          .insert([
            {
              title: title.trim(),
              text: text.trim(),
              created_at: now,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setScripts((prev) => [data as ScriptItem, ...prev]);

        toast.success("Script criado!");
      }
    }

    // =========================
    // CONTACTS
    // =========================
    if (formType === "contact") {
      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from("contacts")
          .update({
            title: title.trim(),
            text: text.trim(),
            phones: toArray(phones),
            whatsapp: toArray(whatsapp),
            emails: toArray(emails),
            updated_at: now,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        setContacts((prev) =>
          prev.map((item) =>
            item.id === editingId ? (data as ContactItem) : item,
          ),
        );

        toast.success("Contato atualizado!");
      } else {
        const { data, error } = await supabase
          .from("contacts")
          .insert([
            {
              title: title.trim(),
              text: text.trim(),
              phones: toArray(phones),
              whatsapp: toArray(whatsapp),
              emails: toArray(emails),
              created_at: now,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setContacts((prev) => [data as ContactItem, ...prev]);

        toast.success("Contato criado!");
      }
    }

    // =========================
    // FAQ
    // =========================
    if (formType === "faq") {
      let fileUrl: string | null | undefined = undefined;

      if (file) {
        const safeName = sanitizeFileName(file.name);
        const filePath = `faq/${Date.now()}-${safeName}`;

        await supabase.storage.from(FAQ_BUCKET).upload(filePath, file);

        const { data: publicUrlData } = supabase.storage
          .from(FAQ_BUCKET)
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
      }

      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from("faqs")
          .update({
            title: title.trim(),
            text: text.trim(),
            author: author.trim(),
            file_url: fileUrl,
            updated_at: now,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        setFaqs((prev) =>
          prev.map((item) =>
            item.id === editingId ? (data as FAQItem) : item,
          ),
        );

        toast.success("FAQ atualizada!");
      } else {
        const { data, error } = await supabase
          .from("faqs")
          .insert([
            {
              title: title.trim(),
              text: text.trim(),
              author: author.trim(),
              file_url: fileUrl ?? null,
              created_at: now,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setFaqs((prev) => [data as FAQItem, ...prev]);

        toast.success("FAQ criada!");
      }
    }

    // =========================
    // DRIVER
    // =========================
    if (formType === "driver") {
      let fileUrl: string | undefined;

      if (driverFile) {
        const safeName = sanitizeFileName(driverFile.name);
        const filePath = `drivers/${Date.now()}-${safeName}`;

        await supabase.storage.from(DRIVER_BUCKET).upload(filePath, driverFile);

        const { data } = supabase.storage
          .from(DRIVER_BUCKET)
          .getPublicUrl(filePath);

        fileUrl = data.publicUrl;
      }

      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from("drivers")
          .update({
            equipment: equipment.trim(),
            author: author.trim(),
            file_url: fileUrl,
            updated_at: now,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        setDrivers((prev) =>
          prev.map((item) =>
            item.id === editingId ? (data as DriverItem) : item,
          ),
        );

        toast.success("Driver atualizado!");
      } else {
        const { data, error } = await supabase
          .from("drivers")
          .insert([
            {
              equipment: equipment.trim(),
              author: author.trim(),
              file_url: fileUrl,
              created_at: now,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setDrivers((prev) => [data as DriverItem, ...prev]);

        toast.success("Driver criado!");
      }
    }

    // =========================
    // LINKS
    // =========================
    if (formType === "link") {
      const normalizedUrl = normalizeUrl(linkUrl);

      if (isEditing && editingId) {
        const { data, error } = await supabase
          .from("important_links")
          .update({
            system: systemName.trim(),
            url: normalizedUrl,
            updated_at: now,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;

        setImportantLinks((prev) =>
          prev.map((item) =>
            item.id === editingId ? (data as ImportantLinkItem) : item,
          ),
        );

        toast.success("Link atualizado!");
      } else {
        const { data, error } = await supabase
          .from("important_links")
          .insert([
            {
              system: systemName.trim(),
              url: normalizedUrl,
              created_at: now,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setImportantLinks((prev) => [data as ImportantLinkItem, ...prev]);

        toast.success("Link criado!");
      }
    }

    resetForm();
    setOpenDialog(false);
  } catch (error: any) {
    console.error(error);
    toast.error("Erro ao salvar");
  } finally {
    setSaving(false);
  }
};
 const filteredScripts = useMemo(() => {
  const filtered = scripts.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.text.toLowerCase().includes(search.toLowerCase())
  );

  return [...filtered].sort((a, b) => {
    const aFav = isFavorite(a.id, "script") ? 1 : 0;
    const bFav = isFavorite(b.id, "script") ? 1 : 0;

    return bFav - aFav;
  });
}, [scripts, search, favorites]);

const filteredContacts = useMemo(() => {
  const filtered = contacts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.text.toLowerCase().includes(search.toLowerCase()) ||
      (c.emails || []).some((email) =>
        email.toLowerCase().includes(search.toLowerCase())
      ) ||
      (c.phones || []).some((phone) =>
        phone.toLowerCase().includes(search.toLowerCase())
      ) ||
      (c.whatsapp || []).some((zap) =>
        zap.toLowerCase().includes(search.toLowerCase())
      )
  );

  return [...filtered].sort((a, b) => {
    const aFav = isFavorite(a.id, "contact") ? 1 : 0;
    const bFav = isFavorite(b.id, "contact") ? 1 : 0;

    return bFav - aFav;
  });
}, [contacts, search, favorites]);

const filteredFaqs = useMemo(() => {
  const filtered = faqs.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.text.toLowerCase().includes(search.toLowerCase()) ||
      (f.author || "").toLowerCase().includes(search.toLowerCase())
  );

  return [...filtered].sort((a, b) => {
    const aFav = isFavorite(a.id, "faq") ? 1 : 0;
    const bFav = isFavorite(b.id, "faq") ? 1 : 0;

    return bFav - aFav;
  });
}, [faqs, search, favorites]);

const filteredDrivers = useMemo(() => {
  const filtered = drivers.filter(
    (d) =>
      d.equipment.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()) ||
      d.file_url.toLowerCase().includes(search.toLowerCase())
  );

  return [...filtered].sort((a, b) => {
    const aFav = isFavorite(a.id, "driver") ? 1 : 0;
    const bFav = isFavorite(b.id, "driver") ? 1 : 0;

    return bFav - aFav;
  });
}, [drivers, search, favorites]);

const filteredImportantLinks = useMemo(() => {
  const filtered = importantLinks.filter(
    (item) =>
      item.system.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase())
  );

  return [...filtered].sort((a, b) => {
    const aFav = isFavorite(a.id, "link") ? 1 : 0;
    const bFav = isFavorite(b.id, "link") ? 1 : 0;

    return bFav - aFav;
  });
}, [importantLinks, search, favorites]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground shadow-md">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20 text-lg font-bold text-primary-foreground">
                <Database />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Suporte TI</h1>
                <h1 className="text-xs text-primary-foreground/70">
                  Base de conhecimento
                </h1>
                
              </div>
            </div>

            <div className="relative ml-auto w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
              <Input
                placeholder="Buscar scripts, contatos, FAQs, drivers ou links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-primary-foreground/20 bg-primary-foreground/10 pl-10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
              />
            </div>

            <Button
              variant="secondary"
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              onClick={() => openNewItemDialog("script")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Script
            </Button>

            <Button
              onClick={() => openNewItemDialog("contact")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Contato
            </Button>

            <Button onClick={() => openNewItemDialog("faq")} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova FAQ
            </Button>

            <Button
              onClick={() => openNewItemDialog("driver")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Driver
            </Button>

            <Button
              onClick={() => openNewItemDialog("link")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Link
            </Button>

        <Button onClick={loadData} className="ml-auto">
        Atualizar
      </Button>
          </div>

          <Tabs defaultValue="scripts" className="w-full">
            <TabsList className="mb-6 grid w-full max-w-5xl grid-cols-5">
              <TabsTrigger
  value="scripts"
  className="gap-2 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  <FileText className="h-4 w-4" />
  Scripts ({filteredScripts.length})
</TabsTrigger>

              <TabsTrigger
  value="contacts"
  className="gap-2 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  <Phone className="h-4 w-4" />
  Contatos ({filteredContacts.length})
</TabsTrigger>

              <TabsTrigger
  value="faq"
  className="gap-2 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  <CircleHelp className="h-4 w-4" />
  FAQs ({filteredFaqs.length})
</TabsTrigger>

              <TabsTrigger
  value="drivers"
  className="gap-2 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  <HardDrive className="h-4 w-4" />
  Drivers ({filteredDrivers.length})
</TabsTrigger>

              <TabsTrigger
  value="links"
  className="gap-2 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
>
  <LinkIcon className="h-4 w-4" />
  Links ({filteredImportantLinks.length})
</TabsTrigger>
            </TabsList>

            <TabsContent value="scripts">
              {loading ? (
                <p className="py-12 text-center text-muted-foreground">
                  Carregando scripts...
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredScripts.map((script) => (
                    <Card
                      key={script.id}
                      className="border-white/20 bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start justify-between gap-2 text-base">
  <span>{script.title}</span>

  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="text-xs">
      Script
    </Badge>

    <Heart
      onClick={() => toggleFavorite(script.id, "script")}
      className={`cursor-pointer ${
        isFavorite(script.id, "script")
          ? "text-red-500 fill-red-500"
          : "text-gray-400"
      }`}
    />
  </div>
</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                          {script.text}
                        </p>

                        <Button
                          size="sm"
                          onClick={() => handleCopy(script.text, script.id)}
                          className="w-full gap-2"
                        >
                          {copiedId === script.id ? (
                            <>
                              <Check className="h-4 w-4" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copiar
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit("script", script)}
                          className="w-full gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>

                        <Button
  size="sm"
  variant="secondary"
  onClick={() => sendToWhatsApp(script.text)}
  className="w-full gap-2"
>
  <MessageCircle className="h-4 w-4" />
  Enviar no WhatsApp
</Button>
<p className="text-xs text-muted-foreground">
  Criado: {script.created_at ? formatDateBR(script.created_at) : "-"}
</p>

{script.updated_at && (
  <p className="text-xs text-muted-foreground">
    Atualizado: {formatDateBR(script.updated_at)}
  </p>
)}

                      </CardContent>
                    </Card>
                  ))}

                  {filteredScripts.length === 0 && (
                    <p className="col-span-full py-12 text-center text-muted-foreground">
                      Nenhum script encontrado.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts">
              {loading ? (
                <p className="py-12 text-center text-muted-foreground">
                  Carregando contatos...
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className="border-white/20 bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start justify-between gap-2 text-base">
  <span>{contact.title}</span>

  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="text-xs">
      Contatos
    </Badge>

    <Heart
      onClick={() => toggleFavorite(contact.id, "contact")}
      className={`cursor-pointer ${
        isFavorite(contact.id, "contact")
          ? "text-red-500 fill-red-500"
          : "text-gray-400"
      }`}
    />
  </div>
</CardTitle>
                        
                      </CardHeader>
                      

                      <CardContent className="space-y-3">
                        {contact.phones && contact.phones.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0 text-primary" />
                            <span className="text-sm">
                              {contact.phones.join(" / ")}
                            </span>
                          </div>
                        )}

                        {contact.whatsapp && contact.whatsapp.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                            <div className="flex flex-wrap gap-2">
                              {contact.whatsapp.map((zap, index) => (
                                <a
                                  key={`${zap}-${index}`}
                                  href={toWhatsappUrl(zap)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                >
                                  {zap}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {contact.emails && contact.emails.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-primary" />
                            <span className="text-sm">
                              {contact.emails.join(" / ")}
                            </span>
                          </div>
                        )}

                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                          {contact.text}
                        </p>

                        <Button
                          size="sm"
                          onClick={() =>
                            handleCopy(
                              [
                                `Setor: ${contact.title}`,
                                contact.phones && contact.phones.length > 0
                                  ? `Telefones: ${contact.phones.join(" / ")}`
                                  : null,
                                contact.whatsapp && contact.whatsapp.length > 0
                                  ? `WhatsApp: ${contact.whatsapp.join(" / ")}`
                                  : null,
                                contact.emails && contact.emails.length > 0
                                  ? `E-mails: ${contact.emails.join(" / ")}`
                                  : null,
                                `Conteúdo: ${contact.text}`,
                              ]
                                .filter(Boolean)
                                .join("\n"),
                              contact.id,
                            )
                          }
                          className="w-full gap-2"
                        >
                          {copiedId === contact.id ? (
                            <>
                              <Check className="h-4 w-4" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copiar
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit("contact", contact)}
                          className="w-full gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <p className="text-xs text-muted-foreground">
  Criado: {contact.created_at ? formatDateBR(contact.created_at) : "-"}
</p>

{contact.updated_at && (
  <p className="text-xs text-muted-foreground">
    Atualizado: {formatDateBR(contact.updated_at)}
  </p>
)}

                      </CardContent>
                    </Card>
                  ))}

                  {filteredContacts.length === 0 && (
                    <p className="col-span-full py-12 text-center text-muted-foreground">
                      Nenhum contato encontrado.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="faq">
              {loading ? (
                <p className="py-12 text-center text-muted-foreground">
                  Carregando FAQ...
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFaqs.map((faq) => (
                    <Card
                      key={faq.id}
                      className="border-white/20 bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start justify-between gap-2 text-base">
  <span>{faq.title}</span>

  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="text-xs">
      FAQ
    </Badge>

    <Heart
      onClick={() => toggleFavorite(faq.id, "faq")}
      className={`cursor-pointer ${
        isFavorite(faq.id, "faq")
          ? "text-red-500 fill-red-500"
          : "text-gray-400"
      }`}
    />
  </div>
</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {faq.author && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4 shrink-0" />
                            <span>Autor: {faq.author}</span>
                          </div>
                        )}

                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                          {faq.text}
                        </p>

                        {faq.file_url && (
                          <a
                            href={faq.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            <Paperclip className="h-4 w-4" />
                            {getFileNameFromUrl(faq.file_url)}
                          </a>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleCopy(faq.text, faq.id)}
                          className="w-full gap-2"
                        >
                          {copiedId === faq.id ? (
                            <>
                              <Check className="h-4 w-4" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copiar
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit("faq", faq)}
                          className="w-full gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>

                        <p className="text-xs text-muted-foreground">
  Criado: {faq.created_at ? formatDateBR(faq.created_at) : "-"}
</p>

{faq.updated_at && (
  <p className="text-xs text-muted-foreground">
    Atualizado: {formatDateBR(faq.updated_at)}
  </p>
)}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredFaqs.length === 0 && (
                    <p className="col-span-full py-12 text-center text-muted-foreground">
                      Nenhuma FAQ encontrada.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="drivers">
              {loading ? (
                <p className="py-12 text-center text-muted-foreground">
                  Carregando drivers...
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDrivers.map((driver) => (
                    <Card
                      key={driver.id}
                      className="border-white/20 bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start justify-between gap-2 text-base">
  <span>{driver.equipment}</span>

  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="text-xs">
      Driver
    </Badge>

    <Heart
      onClick={() => toggleFavorite(driver.id, "driver")}
      className={`cursor-pointer ${
        isFavorite(driver.id, "driver")
          ? "text-red-500 fill-red-500"
          : "text-gray-400"
      }`}
    />
  </div>
</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4 shrink-0" />
                          <span>Autor: {driver.author}</span>
                        </div>

                        <a
                          href={driver.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          <Paperclip className="h-4 w-4" />
                          {getFileNameFromUrl(driver.file_url)}
                        </a>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit("driver", driver)}
                          className="w-full gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <p className="text-xs text-muted-foreground">
  Criado: {driver.created_at ? formatDateBR(driver.created_at) : "-"}
</p>

{driver.updated_at && (
  <p className="text-xs text-muted-foreground">
    Atualizado: {formatDateBR(driver.updated_at)}
  </p>
)}
                        
                      </CardContent>
                    </Card>
                  ))}

                  {filteredDrivers.length === 0 && (
                    <p className="col-span-full py-12 text-center text-muted-foreground">
                      Nenhum driver encontrado.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="links">
              {loading ? (
                <p className="py-12 text-center text-muted-foreground">
                  Carregando links...
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredImportantLinks.map((item) => (
                    <Card
                      key={item.id}
                      className="border-white/20 bg-white/90 backdrop-blur-sm transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="pb-2">
                       

                        <CardTitle className="flex items-start justify-between gap-2 text-base">
 <span>{item.system}</span>

  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="text-xs">
      Links
    </Badge>

    <Heart
      onClick={() => toggleFavorite(item.id, "link")}
      className={`cursor-pointer ${
        isFavorite(item.id, "link")
          ? "text-red-500 fill-red-500"
          : "text-gray-400"
      }`}
    />
  </div>
</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-all text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {item.url}
                        </a>

                        <Button asChild size="sm" className="w-full gap-2">
                          <a href={item.url} target="_blank" rel="noreferrer">
                            Abrir link
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(item.url, item.id)}
                          className="w-full gap-2"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-4 w-4" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copiar link
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit("link", item)}
                          className="w-full gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <p className="text-xs text-muted-foreground">
  Criado: {item.created_at ? formatDateBR(item.created_at) : "-"}
</p>

{item.updated_at && (
  <p className="text-xs text-muted-foreground">
    Atualizado: {formatDateBR(item.updated_at)}
  </p>
)}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredImportantLinks.length === 0 && (
                    <p className="col-span-full py-12 text-center text-muted-foreground">
                      Nenhum link encontrado.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {formType === "script" &&
                    (isEditing ? "Editar Script" : "Adicionar novo Script")}
                  {formType === "contact" &&
                    (isEditing ? "Editar Contato" : "Contato de Setor")}
                  {formType === "faq" &&
                    (isEditing ? "Editar FAQ" : "Adicionar nova FAQ")}
                  {formType === "driver" &&
                    (isEditing ? "Editar Driver" : "Adicionar novo Driver")}
                  {formType === "link" &&
                    (isEditing
                      ? "Editar Link Importante"
                      : "Adicionar Link Importante")}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {(formType === "script" ||
                  formType === "contact" ||
                  formType === "faq") && (
                  <>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Digite o título"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Digite o conteúdo"
                        rows={5}
                      />
                    </div>
                  </>
                )}

                {formType === "contact" && (
                  <>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={phones}
                        onChange={(e) => setPhones(e.target.value)}
                        placeholder="Ex: (85) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="Ex: (85) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        placeholder="Ex: setor@pmenos.com"
                      />
                    </div>
                  </>
                )}

                {formType === "faq" && (
                  <>
                    <div className="space-y-2">
                      <Label>Autor</Label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Digite o nome do autor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Arquivo</Label>
                      <Input
                        type="file"
                        className="
                          cursor-pointer
                          file:bg-primary
                          file:text-white
                          file:border-1
                          file:px-0
                          file:py-0
                          file:rounded-md
                          file:mr-1
                          file:cursor-pointer
                          file:font-medium
                          hover:file:bg-primary/90
                        "
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </>
                )}

                {formType === "driver" && (
                  <>
                    <div className="space-y-2">
                      <Label>Equipamento</Label>
                      <Input
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        placeholder="Digite o nome do equipamento"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Autor</Label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Digite o nome do autor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Driver</Label>
                      <Input
                        type="file"
                        className="
                          cursor-pointer
                          file:bg-primary
                          file:text-white
                          file:border-1
                          file:px-0
                          file:py-0
                          file:rounded-md
                          file:mr-1
                          file:cursor-pointer
                          file:font-medium
                          hover:file:bg-primary/90
                        "
                        onChange={(e) =>
                          setDriverFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </>
                )}

                {formType === "link" && (
                  <>
                    <div className="space-y-2">
                      <Label>Sistema</Label>
                      <Input
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="Ex: Portal de Serviços"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Link</Label>
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Ex: https://portal.exemplo.com"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Index;