import { Card, CardContent } from "@/components/ui/card"

const placeholderImages = [
  { id: 1, label: "Image 1" },
  { id: 2, label: "Image 2" },
  { id: 3, label: "Image 3" },
  { id: 4, label: "Image 4" },
  { id: 5, label: "Image 5" },
  { id: 6, label: "Image 6" },
]

export function V2Gallery() {
  return (
    <section id="gallery" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Gallery</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of retail spaces
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderImages.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">{image.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

