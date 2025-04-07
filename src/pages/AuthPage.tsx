import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome é obrigatório'),
});

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/treino');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      navigate('/treino');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Não foi possível fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth',
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message || "Não foi possível fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };
  
  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      setLoading(true);
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Sua conta foi criada. Seja bem-vindo!",
      });
      
      navigate('/treino');
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível fazer o cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-fitblue h-48 flex items-center justify-center">
        <h1 className="text-white text-3xl font-bold">FitTracker</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center px-4 -mt-20">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
          <div className="flex space-x-2 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 text-center py-2 font-semibold rounded-lg ${
                mode === 'login'
                  ? 'bg-fitblue text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 text-center py-2 font-semibold rounded-lg ${
                mode === 'register'
                  ? 'bg-fitblue text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Cadastro
            </button>
          </div>
          
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            size="lg"
            className="w-full mb-4 font-normal"
            disabled={googleLoading}
          >
            <div className="flex items-center justify-center">
              <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M21.8,12.1c0-0.7-0.1-1.3-0.2-2H12v3.8h5.5c-0.2,1.2-1,2.3-2.1,3v2.5h3.4C20.6,17.8,21.8,15.2,21.8,12.1z"
                />
                <path
                  fill="#34A853"
                  d="M12,22c2.8,0,5.2-0.9,7-2.5l-3.4-2.5c-0.9,0.6-2.1,1-3.5,1c-2.7,0-5-1.8-5.8-4.2H2.8v2.6C4.6,19.7,8.1,22,12,22z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.2,13.8c-0.2-0.6-0.3-1.2-0.3-1.8s0.1-1.2,0.3-1.8V7.5H2.8C2.3,8.9,2,10.4,2,12s0.3,3.1,0.8,4.5L6.2,13.8z"
                />
                <path
                  fill="#EA4335"
                  d="M12,6.8c1.5,0,2.9,0.5,3.9,1.5l3-3c-1.8-1.7-4.1-2.7-6.9-2.7c-4,0-7.4,2.3-9.1,5.6l3.4,2.6C7,8.6,9.3,6.8,12,6.8z"
                />
              </svg>
              {googleLoading ? "Conectando..." : "Entrar com Google"}
            </div>
          </Button>

          <div className="flex items-center my-4">
            <Separator className="flex-1" />
            <span className="px-3 text-sm text-gray-500">ou</span>
            <Separator className="flex-1" />
          </div>

          {mode === 'login' ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-fitblue hover:bg-fitblue-600"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-fitblue hover:bg-fitblue-600"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
