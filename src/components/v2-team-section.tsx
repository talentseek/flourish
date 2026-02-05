import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const teamMembers = [
  {
    name: "Paul Clifford",
    role: "Founder & Director",
    image: "/paulnew.webp",
    bio: "Retail runs in Paul's veins. With 20+ years of experience at household names like Boots, DSG and IKEA, he's shaped the industry from both inside the store and at the heart of the asset. As the driving force behind Flourish, he's a hands-on visionary who swaps boardrooms for high streets and spreadsheets for site visits. A regular industry voice and REVO Board Member, Paul is big on sustainability, community, and making things happen with integrity.",
    funFact: "Has a soft spot for mentoring start-ups and is known for turning pop-ups into powerhouses."
  },
  {
    name: "Michelle Clark",
    role: "Sales Director",
    image: "/michellenew.webp",
    bio: "Michelle brings energy, empathy and enterprise in equal measure. With 8+ years in placemaking and a successful side hustle in running small businesses, she's Flourish's secret weapon in spotting opportunity and creating momentum. From Tesco and MARS to MasterCard and Camelot, her client list is gold-plated, but her heart is always with the independents.",
    funFact: "Think flip-flops, cocktails and sunshine — she's happiest where it's 28°C and there's a mojito in hand."
  },
  {
    name: "Sharon O'Rourke",
    role: "Regional Manager, Scotland",
    image: "/sharonnew.webp",
    bio: "With her own successful marketing and events business, Sharon knows what makes a local high street tick. She leads from Giffnock with flair, supporting 60+ traders and transforming spaces into community anchors. Known for balancing commercial nous with neighbourhood charm.",
    funFact: "More likely to be found plotting a Christmas lights switch-on than stuck behind a desk."
  },
  {
    name: "Giorgia Shepherd",
    role: "Regional Manager",
    image: "/giorgianew.webp",
    bio: "Giorgia combines a foodie's eye for detail (thanks to Costa and Gail's) with a 5-star safety track record. She's the go-to for operators who need support that's equal parts practical and personal.",
    funFact: "Has a reputation for calming chaos — whether it's logistics, licensing or latte-making."
  },
  {
    name: "Jemma Mills",
    role: "Regional Manager",
    image: "/jemmanew.webp",
    bio: "From WH Smith to Welcome Break, Jemma's been there, sold that. She's brilliant at building long-lasting relationships and thrives on helping businesses shine — whether you're new to retail or scaling up.",
    funFact: "When she's not supporting traders, she's in the stables — a dedicated horse trainer and proud equestrian."
  },
  {
    name: "Amanda Bishop",
    role: "Regional Manager",
    image: "/amandanew.webp",
    bio: "With a career spanning FMCG giants and entrepreneurial ventures, Amanda brings a laser focus to revenue growth and customer service. She's strategic, practical and fiercely loyal to the brands she champions.",
    funFact: "Ask her anything about wine pairings or obscure travel books — she's got you covered."
  },
  {
    name: "Paula Muers",
    role: "Regional Manager",
    image: "/paulanew.webp",
    bio: "A powerhouse of experience across retail, B2B and wellbeing, Paula brings warmth and wisdom to every activation. She's walked the walk — from big brands to small start-ups — and genuinely lives Flourish's ethos of people-first partnerships.",
    funFact: "Nothing makes her happier than a full garden, a strong coffee, and a good chat."
  },
  {
    name: "Callum Clifford",
    role: "Regional Manager & IT Lead",
    image: "/callumnew.webp",
    bio: "Callum blends sharp business sense with tech innovation. With roots in the automotive and property sectors — and his own entrepreneurial ventures — he's passionate about service, systems, and scaling smart. When things need fixing, streamlining, or elevating, he's your guy.",
    funFact: "Runs Flourish's IT like a Formula 1 pit crew — fast, smooth, and with zero fuss."
  },
  {
    name: "Suki Sall",
    role: "Finance & Accounts Lead",
    image: "/sukinew.webp",
    bio: "With two decades of accounting experience, Suki keeps the Flourish financials in immaculate order. But don't let the numbers fool you — she's just as happy getting out to sites and seeing how her spreadsheets translate to real-world impact.",
    funFact: "Loves exploring new towns via their markets — calculator in bag, curiosity in hand."
  },
  {
    name: "Daanyaal Tahir",
    role: "Accounts Assistant (Apprentice)",
    image: "/daanyaalnew.webp",
    bio: "Flourish's first apprentice and rising finance star, Daanyaal is already making waves with his calm approach, sharp attention to detail and eagerness to learn.",
    funFact: "Could probably solve a spreadsheet faster than you can say 'year-end close.'"
  }
]

export function V2TeamSection() {
  return (
    <section id="team" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
            Team / About Us
          </h2>
          <p className="text-xl text-[#4D4A46] font-medium">
            We Intelligently Fill Spaces to Create Thriving, Sustainable Places
          </p>
        </div>

        {/* Main Description */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-[#D8D8D6]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#4D4A46]">About Flourish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Flourish team is highly experienced in all aspects of shopping centre, high street
                and town centre environments.
              </p>
              <p className="text-muted-foreground">
                From sales, visual merchandising and finance to placemaking, brand, marketing and
                communications — we bring comprehensive expertise to every project.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Image */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="relative w-full aspect-video bg-white rounded-lg overflow-hidden border border-[#D8D8D6]">
            <Image
              src="/team.jpg"
              alt="Flourish Team"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card key={index} className="border-[#D8D8D6]">
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#D8D8D6]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-[#4D4A46] mb-1">{member.name}</CardTitle>
                    <p className="text-sm text-[#4D4A46] font-semibold">{member.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                <div className="pt-3 border-t border-[#D8D8D6]">
                  <p className="text-xs text-muted-foreground italic">
                    <strong className="text-[#4D4A46]">Fun fact:</strong> {member.funFact}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


