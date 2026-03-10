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
  Computer,
  Pencil,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import backgroundImage from "@/assets/background.png";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ScriptItem = {
  id: number;
  title: string;
  text: string;
};

type ContactItem = {
  id: number;
  title: string;
  text: string;
  phones?: string[];
  whatsapp?: string[];
  emails?: string[];
};

type FAQItem = {
  id: number;
  title: string;
  text: string;
  author?: string | null;
  file_url?: string | null;
};

type DriverItem = {
  id: number;
  equipment: string;
  author: string;
  file_url: string;
};

type FormType = "script" | "contact" | "faq" | "driver";

const FAQ_BUCKET = "faq-files";
const DRIVER_BUCKET = "driver-files";

const Index = () => {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);

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
    setIsEditing(false);
    setEditingId(null);
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
    item: ScriptItem | ContactItem | FAQItem | DriverItem,
  ) => {
    resetForm();
    setFormType(type);
    setIsEditing(true);
    setEditingId(item.id);
    setOpenDialog(true);

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
      const [scriptsRes, contactsRes, faqsRes, driversRes] = await Promise.all([
        supabase.from("scripts").select("*").order("id", { ascending: false }),
        supabase.from("contacts").select("*").order("id", { ascending: false }),
        supabase.from("faqs").select("*").order("id", { ascending: false }),
        supabase.from("drivers").select("*").order("id", { ascending: false }),
      ]);

      if (scriptsRes.error) throw scriptsRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (faqsRes.error) throw faqsRes.error;
      if (driversRes.error) throw driversRes.error;

      setScripts((scriptsRes.data as ScriptItem[]) || []);
      setContacts((contactsRes.data as ContactItem[]) || []);
      setFaqs((faqsRes.data as FAQItem[]) || []);
      setDrivers((driversRes.data as DriverItem[]) || []);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error(error?.message || "Erro ao carregar dados do Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (formType === "driver") {
      if (!equipment.trim() || !author.trim()) {
        toast.error("Preencha equipamento e autor.");
        return;
      }

      if (!isEditing && !driverFile) {
        toast.error("Selecione o arquivo do driver.");
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

    if (formType === "contact") {
      const normalizedTitle = title.trim().toLowerCase();
      const newPhones = toArray(phones);
      const newWhatsapp = toArray(whatsapp);
      const newEmails = toArray(emails).map((email) => email.toLowerCase());

      const duplicateContact = contacts.find((contact) => {
        if (isEditing && contact.id === editingId) return false;

        const sameTitle =
          contact.title.trim().toLowerCase() === normalizedTitle;

        const samePhone = (contact.phones || []).some((phone) =>
          newPhones.includes(phone),
        );

        const sameWhatsapp = (contact.whatsapp || []).some((zap) =>
          newWhatsapp.includes(zap),
        );

        const sameEmail = (contact.emails || []).some((email) =>
          newEmails.includes(email.toLowerCase()),
        );

        return sameTitle || samePhone || sameWhatsapp || sameEmail;
      });

      if (duplicateContact) {
        if (duplicateContact.title.trim().toLowerCase() === normalizedTitle) {
          toast.error("Já existe um setor cadastrado com esse nome.");
          return;
        }

        const phoneDuplicado = (duplicateContact.phones || []).find((phone) =>
          newPhones.includes(phone),
        );
        if (phoneDuplicado) {
          toast.error(`O telefone ${phoneDuplicado} já está cadastrado.`);
          return;
        }

        const whatsappDuplicado = (duplicateContact.whatsapp || []).find(
          (zap) => newWhatsapp.includes(zap),
        );
        if (whatsappDuplicado) {
          toast.error(`O WhatsApp ${whatsappDuplicado} já está cadastrado.`);
          return;
        }

        const emailDuplicado = (duplicateContact.emails || []).find((email) =>
          newEmails.includes(email.toLowerCase()),
        );
        if (emailDuplicado) {
          toast.error(`O e-mail ${emailDuplicado} já está cadastrado.`);
          return;
        }
      }
    }

    setSaving(true);

    try {
      if (formType === "script") {
        const { data, error } = await supabase
          .from("scripts")
          .insert([
            {
              title: title.trim(),
              text: text.trim(),
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setScripts((prev) => [data as ScriptItem, ...prev]);
        toast.success("Script adicionado com sucesso!");
      }

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
          toast.success("Contato atualizado com sucesso!");
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
              },
            ])
            .select()
            .single();

          if (error) throw error;

          setContacts((prev) => [data as ContactItem, ...prev]);
          toast.success("Contato adicionado com sucesso!");
        }
      }

      if (formType === "faq") {
        let fileUrl: string | null | undefined = undefined;

        if (file) {
          const safeName = sanitizeFileName(file.name);
          const filePath = `faq/${Date.now()}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from(FAQ_BUCKET)
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from(FAQ_BUCKET)
            .getPublicUrl(filePath);

          fileUrl = publicUrlData.publicUrl;
        }

        if (isEditing && editingId) {
          const updatePayload: {
            title: string;
            text: string;
            author: string;
            file_url?: string | null;
          } = {
            title: title.trim(),
            text: text.trim(),
            author: author.trim(),
          };

          if (fileUrl !== undefined) {
            updatePayload.file_url = fileUrl;
          }

          const { data, error } = await supabase
            .from("faqs")
            .update(updatePayload)
            .eq("id", editingId)
            .select()
            .single();

          if (error) throw error;

          setFaqs((prev) =>
            prev.map((item) =>
              item.id === editingId ? (data as FAQItem) : item,
            ),
          );
          toast.success("FAQ atualizada com sucesso!");
        } else {
          const { data, error } = await supabase
            .from("faqs")
            .insert([
              {
                title: title.trim(),
                text: text.trim(),
                author: author.trim(),
                file_url: fileUrl ?? null,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          setFaqs((prev) => [data as FAQItem, ...prev]);
          toast.success("FAQ adicionada com sucesso!");
        }
      }

      if (formType === "driver") {
        let fileUrl: string | undefined = undefined;

        if (driverFile) {
          const safeName = sanitizeFileName(driverFile.name);
          const filePath = `drivers/${Date.now()}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from(DRIVER_BUCKET)
            .upload(filePath, driverFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from(DRIVER_BUCKET)
            .getPublicUrl(filePath);

          fileUrl = publicUrlData.publicUrl;
        }

        if (isEditing && editingId) {
          const updatePayload: {
            equipment: string;
            author: string;
            file_url?: string;
          } = {
            equipment: equipment.trim(),
            author: author.trim(),
          };

          if (fileUrl) {
            updatePayload.file_url = fileUrl;
          }

          const { data, error } = await supabase
            .from("drivers")
            .update(updatePayload)
            .eq("id", editingId)
            .select()
            .single();

          if (error) throw error;

          setDrivers((prev) =>
            prev.map((item) =>
              item.id === editingId ? (data as DriverItem) : item,
            ),
          );
          toast.success("Driver atualizado com sucesso!");
        } else {
          if (!fileUrl) {
            toast.error("Selecione o arquivo do driver.");
            setSaving(false);
            return;
          }

          const { data, error } = await supabase
            .from("drivers")
            .insert([
              {
                equipment: equipment.trim(),
                author: author.trim(),
                file_url: fileUrl,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          setDrivers((prev) => [data as DriverItem, ...prev]);
          toast.success("Driver adicionado com sucesso!");
        }
      }

      resetForm();
      setOpenDialog(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(error?.message || "Erro ao salvar registro.");
    } finally {
      setSaving(false);
    }
  };

  const filteredScripts = useMemo(
    () =>
      scripts.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.text.toLowerCase().includes(search.toLowerCase()),
      ),
    [scripts, search],
  );

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.text.toLowerCase().includes(search.toLowerCase()) ||
          (c.emails || []).some((email) =>
            email.toLowerCase().includes(search.toLowerCase()),
          ) ||
          (c.phones || []).some((phone) =>
            phone.toLowerCase().includes(search.toLowerCase()),
          ) ||
          (c.whatsapp || []).some((zap) =>
            zap.toLowerCase().includes(search.toLowerCase()),
          ),
      ),
    [contacts, search],
  );

  const filteredFaqs = useMemo(
    () =>
      faqs.filter(
        (f) =>
          f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.text.toLowerCase().includes(search.toLowerCase()) ||
          (f.author || "").toLowerCase().includes(search.toLowerCase()),
      ),
    [faqs, search],
  );

  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (d) =>
          d.equipment.toLowerCase().includes(search.toLowerCase()) ||
          d.author.toLowerCase().includes(search.toLowerCase()) ||
          d.file_url.toLowerCase().includes(search.toLowerCase()),
      ),
    [drivers, search],
  );

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
                <Computer />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Suporte</h1>
                <p className="text-xs text-primary-foreground/70">
                  Base de conhecimento
                </p>
              </div>
            </div>

            <div className="relative ml-auto w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
              <Input
                placeholder="Buscar scripts, contatos, FAQs ou drivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-primary-foreground/20 bg-primary-foreground/10 pl-10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
              />
            </div>
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

            <Button variant="ghost" onClick={loadData} className="ml-auto">
              Atualizar
            </Button>
          </div>

          <Tabs defaultValue="scripts" className="w-full">
            <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="scripts" className="gap-2">
                <FileText className="h-4 w-4" />
                Scripts ({filteredScripts.length})
              </TabsTrigger>

              <TabsTrigger value="contacts" className="gap-2">
                <Phone className="h-4 w-4" />
                Contatos ({filteredContacts.length})
              </TabsTrigger>

              <TabsTrigger value="faq" className="gap-2">
                <CircleHelp className="h-4 w-4" />
                FAQs ({filteredFaqs.length})
              </TabsTrigger>

              <TabsTrigger value="drivers" className="gap-2">
                <HardDrive className="h-4 w-4" />
                Drivers ({filteredDrivers.length})
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
                          <Badge variant="secondary" className="text-xs">
                            Script
                          </Badge>
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
                        <CardTitle className="text-base">
                          {contact.title}
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
                            <span className="text-sm">
                              {contact.whatsapp.join(" / ")}
                            </span>
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
                          <Badge variant="secondary" className="text-xs">
                            FAQ
                          </Badge>
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
                          <Badge variant="secondary" className="text-xs">
                            Driver
                          </Badge>
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
          </Tabs>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {formType === "script" && "Adicionar novo Script"}
                  {formType === "contact" &&
                    (isEditing ? "Editar Contato" : "Contato de Setor")}
                  {formType === "faq" &&
                    (isEditing ? "Editar FAQ" : "Adicionar nova FAQ")}
                  {formType === "driver" &&
                    (isEditing ? "Editar Driver" : "Adicionar novo Driver")}
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
                        onChange={(e) =>
                          setDriverFile(e.target.files?.[0] || null)
                        }
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
                    {saving
                      ? "Salvando..."
                      : formType === "script"
                        ? "Salvar"
                        : isEditing
                          ? "Atualizar"
                          : "Salvar"}
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
