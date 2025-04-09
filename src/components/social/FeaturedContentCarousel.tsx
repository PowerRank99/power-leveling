
import React from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Award } from 'lucide-react';

const FeaturedContentCarousel = () => {
  const carouselItems = [
    {
      title: "Conquiste sua primeira medalha",
      description: "Complete um treino hoje e ganhe XP extra!",
      icon: <Award className="h-8 w-8 text-white" />,
      action: "Começar treino",
      bgColor: "from-fitblue-500 to-fitblue-700",
      link: "/treino"
    },
    {
      title: "Entre para uma guilda",
      description: "Treine com amigos e conquiste juntos",
      icon: <Users className="h-8 w-8 text-white" />,
      action: "Ver guildas",
      bgColor: "from-fitpurple-500 to-fitpurple-700",
      link: "/guilds"
    },
    {
      title: "Conquistas desbloqueadas",
      description: "Veja seu progresso e próximas metas",
      icon: <Trophy className="h-8 w-8 text-white" />,
      action: "Ver conquistas",
      bgColor: "from-fitgreen-500 to-fitgreen-700",
      link: "/conquistas"
    }
  ];

  return (
    <Carousel className="mb-6 w-full">
      <CarouselContent>
        {carouselItems.map((item, index) => (
          <CarouselItem key={index}>
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className={`p-0`}>
                <div className={`flex items-center p-6 bg-gradient-to-r ${item.bgColor} text-white`}>
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="ml-4 bg-white hover:bg-white/90 text-gray-800"
                    onClick={() => window.location.href = item.link}
                  >
                    {item.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-2">
        <CarouselPrevious className="relative static left-0 right-auto mr-2 translate-y-0" />
        <CarouselNext className="relative static right-0 left-auto translate-y-0" />
      </div>
    </Carousel>
  );
};

export default FeaturedContentCarousel;
