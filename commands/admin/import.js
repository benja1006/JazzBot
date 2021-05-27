module.exports = {
  name: 'import',
  description: 'Imports data to the mysql server',
  aliases: [''],
  usage: ['import dataset'],
  reqMusic: false,
  execute(msg, args) {
    if(args.length > 1 && args.length < 3){
      let type = args.shift();
      let input = args;
      switch(type){
      }
    }

  },
}
