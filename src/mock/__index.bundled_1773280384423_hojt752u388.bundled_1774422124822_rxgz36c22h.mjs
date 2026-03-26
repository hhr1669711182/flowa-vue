// src/mock/_index.bundled_1773280384423_hojt752u388.mjs
var index_default = [
  {
    url: "/api/orders",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "ok",
        "data|10": [
          {
            "id|+1": 10001,
            date: "@datetime",
            customer: "@name",
            amount: "\xA5 @integer(100, 5000)",
            "status|1": ["Pending", "Processing", "Completed", "Cancelled"]
          }
        ]
      };
    }
  },
  {
    url: "/api/products",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "ok",
        "data|20": [
          {
            "id|+1": 1,
            name: "@title(3, 5)",
            price: "\xA5 @integer(10, 1000)",
            "stock|10-200": 100,
            "category|1": ["Electronics", "Clothing", "Home", "Books"]
          }
        ]
      };
    }
  }
];
export {
  index_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21vY2svc3JjL21vY2svaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiQzpcXFxcVXNlcnNcXFxcMTY2OTdcXFxcRGVza3RvcFxcXFxoaHJcXFxcZ2l0aHViXFxcXGZsb3dhLXZ1ZVxcXFxzcmNcXFxcbW9ja1xcXFxpbmRleC50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJDOlxcXFxVc2Vyc1xcXFwxNjY5N1xcXFxEZXNrdG9wXFxcXGhoclxcXFxnaXRodWJcXFxcZmxvd2EtdnVlXFxcXHNyY1xcXFxtb2NrXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9DOi9Vc2Vycy8xNjY5Ny9EZXNrdG9wL2hoci9naXRodWIvZmxvd2EtdnVlL3NyYy9tb2NrL2luZGV4LnRzXCI7aW1wb3J0IHR5cGUgeyBNb2NrTWV0aG9kIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9jaydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL29yZGVycycsXHJcbiAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgcmVzcG9uc2U6ICgpID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb2RlOiAyMDAsXHJcbiAgICAgICAgbWVzc2FnZTogJ29rJyxcclxuICAgICAgICAnZGF0YXwxMCc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgJ2lkfCsxJzogMTAwMDEsXHJcbiAgICAgICAgICAgIGRhdGU6ICdAZGF0ZXRpbWUnLFxyXG4gICAgICAgICAgICBjdXN0b21lcjogJ0BuYW1lJyxcclxuICAgICAgICAgICAgYW1vdW50OiAnXHUwMEE1IEBpbnRlZ2VyKDEwMCwgNTAwMCknLFxyXG4gICAgICAgICAgICAnc3RhdHVzfDEnOiBbJ1BlbmRpbmcnLCAnUHJvY2Vzc2luZycsICdDb21wbGV0ZWQnLCAnQ2FuY2VsbGVkJ11cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvcHJvZHVjdHMnLFxyXG4gICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgIHJlc3BvbnNlOiAoKSA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY29kZTogMjAwLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdvaycsXHJcbiAgICAgICAgJ2RhdGF8MjAnOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICdpZHwrMSc6IDEsXHJcbiAgICAgICAgICAgIG5hbWU6ICdAdGl0bGUoMywgNSknLFxyXG4gICAgICAgICAgICBwcmljZTogJ1x1MDBBNSBAaW50ZWdlcigxMCwgMTAwMCknLFxyXG4gICAgICAgICAgICAnc3RvY2t8MTAtMjAwJzogMTAwLFxyXG4gICAgICAgICAgICAnY2F0ZWdvcnl8MSc6IFsnRWxlY3Ryb25pY3MnLCAnQ2xvdGhpbmcnLCAnSG9tZScsICdCb29rcyddXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5dIGFzIE1vY2tNZXRob2RbXVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsSUFBTyxnQkFBUTtFQUNiO0lBQ0UsS0FBSztJQUNMLFFBQVE7SUFDUixVQUFVLE1BQU07QUFDZCxhQUFPO1FBQ0wsTUFBTTtRQUNOLFNBQVM7UUFDVCxXQUFXO1VBQ1Q7WUFDRSxTQUFTO1lBQ1QsTUFBTTtZQUNOLFVBQVU7WUFDVixRQUFRO1lBQ1IsWUFBWSxDQUFDLFdBQVcsY0FBYyxhQUFhLFdBQVc7VUFDaEU7UUFDRjtNQUNGO0lBQ0Y7RUFDRjtFQUNBO0lBQ0UsS0FBSztJQUNMLFFBQVE7SUFDUixVQUFVLE1BQU07QUFDZCxhQUFPO1FBQ0wsTUFBTTtRQUNOLFNBQVM7UUFDVCxXQUFXO1VBQ1Q7WUFDRSxTQUFTO1lBQ1QsTUFBTTtZQUNOLE9BQU87WUFDUCxnQkFBZ0I7WUFDaEIsY0FBYyxDQUFDLGVBQWUsWUFBWSxRQUFRLE9BQU87VUFDM0Q7UUFDRjtNQUNGO0lBQ0Y7RUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
