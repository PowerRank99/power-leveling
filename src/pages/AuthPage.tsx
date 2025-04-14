import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
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
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/workout');
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
      
      navigate('/workout');
    } catch (error: any) {
      console.error('Login error:', error);
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
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/workout',
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Erro no login com Google",
        description: error.message || "Não foi possível fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      setLoading(true);
      
      // Sign up the user
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
      
      navigate('/workout');
    } catch (error: any) {
      console.error('Registration error:', error);
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
    <div className="min-h-screen bg-midnight-deep flex flex-col">
      <div className="bg-gradient-to-r from-arcane to-valor h-48 flex items-center justify-center">
        <h1 className="text-text-primary text-3xl font-bold font-orbitron">PowerLeveling</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center px-4 -mt-20">
        <div className="premium-card w-full max-w-md p-6 shadow-elevated">
          <div className="flex space-x-2 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 text-center py-2 font-semibold rounded-lg font-sora ${
                mode === 'login'
                  ? 'bg-arcane text-text-primary shadow-glow-subtle'
                  : 'bg-midnight-elevated text-text-tertiary border border-divider'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 text-center py-2 font-semibold rounded-lg font-sora ${
                mode === 'register'
                  ? 'bg-arcane text-text-primary shadow-glow-subtle'
                  : 'bg-midnight-elevated text-text-tertiary border border-divider'
              }`}
            >
              Cadastro
            </button>
          </div>
          
          {mode === 'login' ? (
            <>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-primary font-sora">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu@email.com" 
                            {...field} 
                            className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora"
                          />
                        </FormControl>
                        <FormMessage className="text-valor font-sora" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-primary font-sora">Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="********" 
                            {...field} 
                            className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora"
                          />
                        </FormControl>
                        <FormMessage className="text-valor font-sora" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle font-sora"
                    disabled={loading}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6">
                <div className="relative">
                  <Separator className="my-4 bg-divider" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-midnight-card px-2 text-sm text-text-tertiary font-sora">ou</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline" 
                  onClick={handleGoogleSignIn}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-midnight-elevated border-divider text-text-primary hover:bg-midnight-card font-sora"
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
                  </svg>
                  {loading ? 'Processando...' : 'Entrar com Google'}
                </Button>
              </div>
            </>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary font-sora">Nome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu nome" 
                          {...field} 
                          className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora"
                        />
                      </FormControl>
                      <FormMessage className="text-valor font-sora" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary font-sora">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          {...field} 
                          className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora"
                        />
                      </FormControl>
                      <FormMessage className="text-valor font-sora" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-primary font-sora">Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="********" 
                          {...field} 
                          className="bg-midnight-elevated border-divider text-text-primary placeholder:text-text-tertiary font-sora"
                        />
                      </FormControl>
                      <FormMessage className="text-valor font-sora" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle font-sora"
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
