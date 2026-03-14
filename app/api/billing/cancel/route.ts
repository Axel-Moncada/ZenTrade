import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAccessToken, PAYPAL_BASE } from "@/lib/paypal/client";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener la suscripción activa del usuario
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("processor_subscription_id, status")
      .eq("user_id", user.id)
      .in("status", ["active", "on_trial", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      return NextResponse.json({ error: "No se encontró suscripción activa" }, { status: 404 });
    }

    const subscriptionId = subscription.processor_subscription_id;

    // Cancelar en PayPal
    const token = await getAccessToken();
    const ppResponse = await fetch(
      `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Cancelado por el usuario desde el dashboard" }),
      }
    );

    // PayPal retorna 204 No Content en éxito
    if (!ppResponse.ok && ppResponse.status !== 204) {
      const errText = await ppResponse.text();
      console.error("[Cancel] PayPal error:", ppResponse.status, errText);
      return NextResponse.json(
        { error: "Error al cancelar en PayPal" },
        { status: 500 }
      );
    }

    // Actualizar estado en Supabase
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("processor_subscription_id", subscriptionId);

    console.log(`[Cancel] Suscripción ${subscriptionId} cancelada para user=${user.id}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Cancel] Error inesperado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
