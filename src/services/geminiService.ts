export async function getDiscoveryQuestions(idea: string, category: string, idToken?: string): Promise<string[]> {
  try {
    const response = await fetch('/api/gemini/discovery', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ idea, category })
    });
    
    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error || 'Falha na API de descoberta');
    }
    
    const data = await response.json();
    return data.questions || [];
  } catch (error: any) {
    console.error("Discovery error:", error);
    // If it's a subscription error, propagate it
    if (error.message.includes('Assinatura')) {
       throw error;
    }
    return [
      "Qual o público-alvo principal?",
      "Qual o tom de voz desejado?",
      "Existe algum detalhe técnico obrigatório?"
    ];
  }
}

export async function forgeElitePrompt(
  idea: string, 
  category: string, 
  destination: string, 
  answers: Record<string, string>,
  idToken?: string
): Promise<string> {
  try {
    const response = await fetch('/api/gemini/forge', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({ idea, category, destination, answers })
    });
    
    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error || 'Falha na API de forja');
    }
    
    const data = await response.json();
    return data.prompt || "Falha na geração do comando.";
  } catch (error: any) {
    console.error("Forge error:", error);
    throw error;
  }
}
